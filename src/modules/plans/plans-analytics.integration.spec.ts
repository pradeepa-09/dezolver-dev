import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-v4',
}));

import { AppModule } from '../../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Phase 7 (Plans) & Phase 8 (Analytics) Integration', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let superAdminToken: string;
  let adminToken: string;
  let userToken: string;

  const mockPrisma = {
    plan: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    college: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    subscription: {
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-12345678901234567890';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    const configService = moduleFixture.get<ConfigService>(ConfigService);
    const secret = configService.get<string>('JWT_SECRET');

    superAdminToken = jwtService.sign(
      { sub: 'super-admin-id', role: 'SUPER_ADMIN' },
      { secret },
    );
    adminToken = jwtService.sign(
      { sub: 'admin-id', role: 'ADMIN' },
      { secret },
    );
    userToken = jwtService.sign({ sub: 'user-id', role: 'USER' }, { secret });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phase 7: Plans Endpoints', () => {
    it('GET /api/plans returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/api/plans').expect(401);
    });

    it('GET /api/plans returns 403 for non-SUPER_ADMIN user', async () => {
      await request(app.getHttpServer())
        .get('/api/plans')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('GET /api/plans returns 200 and plans list for SUPER_ADMIN', async () => {
      const mockList = [
        {
          id: 'plan-1',
          name: 'Starter Plan',
          description: 'Basic features',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { subscriptions: 5 },
        },
      ];
      mockPrisma.plan.findMany.mockResolvedValue(mockList);

      const res = await request(app.getHttpServer())
        .get('/api/plans')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(res.body).toEqual(mockList);
    });

    it('POST /api/plans validates DTO and rejects missing name with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/plans')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ description: 'No name provided' })
        .expect(400);
    });

    it('POST /api/plans rejects non-whitelisted fields with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/plans')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Valid Name',
          unsupportedField: 'Hacked',
        })
        .expect(400);
    });

    it('POST /api/plans creates plan and records audit log for SUPER_ADMIN', async () => {
      mockPrisma.plan.findFirst.mockResolvedValue(null);
      const created = {
        id: 'plan-new',
        name: 'Growth Plan',
        description: 'For growing colleges',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPrisma.plan.create.mockResolvedValue(created);
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

      const res = await request(app.getHttpServer())
        .post('/api/plans')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Growth Plan',
          description: 'For growing colleges',
        })
        .expect(201);

      expect(res.body).toEqual(created);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'PLAN_CREATED',
          actorId: 'super-admin-id',
          targetId: 'plan-new',
          targetType: 'Plan',
          metadata: {
            name: 'Growth Plan',
            description: 'For growing colleges',
          },
        },
      });
    });

    it('GET /api/plans/:id returns plan details with subscriptions', async () => {
      const mockPlan = {
        id: 'plan-new',
        name: 'Growth Plan',
        description: 'For growing colleges',
        subscriptions: [],
        _count: { subscriptions: 0 },
      };
      mockPrisma.plan.findUnique.mockResolvedValue(mockPlan);

      const res = await request(app.getHttpServer())
        .get('/api/plans/plan-new')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(res.body).toEqual(mockPlan);
    });

    it('PATCH /api/plans/:id updates plan and records audit log', async () => {
      const existing = {
        id: 'plan-new',
        name: 'Growth Plan',
        description: 'Old description',
      };
      mockPrisma.plan.findUnique.mockResolvedValue(existing);
      mockPrisma.plan.findFirst.mockResolvedValue(null);
      const updated = {
        ...existing,
        name: 'Growth Plan Pro',
        description: 'Updated description',
      };
      mockPrisma.plan.update.mockResolvedValue(updated);
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-2' });

      const res = await request(app.getHttpServer())
        .patch('/api/plans/plan-new')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Growth Plan Pro',
          description: 'Updated description',
        })
        .expect(200);

      expect(res.body).toEqual(updated);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'PLAN_UPDATED',
          actorId: 'super-admin-id',
          targetId: 'plan-new',
          targetType: 'Plan',
          metadata: {
            name: 'Growth Plan Pro',
            description: 'Updated description',
          },
        },
      });
    });
  });

  describe('Phase 8: Platform Analytics Endpoints', () => {
    it('GET /api/analytics/platform returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/api/analytics/platform')
        .expect(401);
    });

    it('GET /api/analytics/platform returns 403 for non-SUPER_ADMIN', async () => {
      await request(app.getHttpServer())
        .get('/api/analytics/platform')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('GET /api/analytics/platform returns real calculated aggregation data for SUPER_ADMIN', async () => {
      mockPrisma.college.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(1);

      mockPrisma.user.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(14)
        .mockResolvedValueOnce(19);

      mockPrisma.plan.count.mockResolvedValueOnce(3);

      mockPrisma.subscription.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(4);

      mockPrisma.auditLog.findMany.mockResolvedValueOnce([]);

      const res = await request(app.getHttpServer())
        .get('/api/analytics/platform')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(res.body).toEqual({
        colleges: {
          total: 5,
          active: 4,
          suspended: 1,
        },
        users: {
          total: 20,
          byRole: {
            superAdmin: 1,
            admin: 5,
            user: 14,
          },
          active: 19,
        },
        plans: {
          total: 3,
        },
        subscriptions: {
          total: 4,
          active: 4,
        },
        recentActivity: [],
      });
    });
  });
});
