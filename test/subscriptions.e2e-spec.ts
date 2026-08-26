/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Subscriptions Backend (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let superAdminToken = '';
  let userToken = '';
  let adminToken = '';

  let testCollegeId = '';
  let testPlanId = '';
  let subscriptionId = '';

  const superAdminEmail = 'admin@dev.local';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Setup basic tokens
    const superAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });
    if (superAdmin) {
      superAdminToken = jwtService.sign({
        sub: superAdmin.id,
        role: 'SUPER_ADMIN',
      });
    } else {
      // Create a dummy token if not found (should be seeded)
      superAdminToken = jwtService.sign({
        sub: 'super-admin-id',
        role: 'SUPER_ADMIN',
      });
    }

    userToken = jwtService.sign({ sub: 'user-id', role: 'USER' });
    adminToken = jwtService.sign({ sub: 'admin-id', role: 'ADMIN' });

    // Create a Plan
    const plan = await prisma.plan.create({
      data: { name: 'E2E Test Plan', description: 'Test' },
    });
    testPlanId = plan.id;

    // Create a College
    const college = await prisma.college.create({
      data: { name: 'E2E College for Sub', domain: 'e2e-sub.example.com' },
    });
    testCollegeId = college.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: { targetType: 'Subscription' },
    });
    await prisma.subscription.deleteMany({
      where: { collegeId: testCollegeId },
    });
    await prisma.college.delete({ where: { id: testCollegeId } });
    await prisma.plan.delete({ where: { id: testPlanId } });
    await app.close();
  });

  describe('Authorization & Authentication', () => {
    it('No JWT -> 401', async () => {
      await request(app.getHttpServer()).get('/subscriptions').expect(401);
    });

    it('Invalid JWT -> 401', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', 'Bearer invalid')
        .expect(401);
    });

    it('USER -> 403', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('ADMIN -> 403', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('SUPER_ADMIN -> allowed', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });
  });

  describe('CRUD Operations', () => {
    it('Create valid subscription -> 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ collegeId: testCollegeId, planId: testPlanId })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('ACTIVE');
      subscriptionId = response.body.id;

      // Verify AuditLog was created
      const logs = await prisma.auditLog.findMany({
        where: { targetId: subscriptionId, action: 'SUBSCRIPTION_CREATED' },
      });
      expect(logs.length).toBe(1);
    });

    it('Invalid college -> 404', async () => {
      await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          collegeId: '11111111-1111-4111-a111-111111111111',
          planId: testPlanId,
        })
        .expect(404);
    });

    it('Invalid plan -> 404', async () => {
      await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          collegeId: testCollegeId,
          planId: '11111111-1111-4111-a111-111111111111',
        })
        .expect(404);
    });

    it('Duplicate active subscription -> 409', async () => {
      await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ collegeId: testCollegeId, planId: testPlanId })
        .expect(409);
    });

    it('Get all subscriptions -> 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('Get subscription by ID -> 200', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(subscriptionId);
      expect(response.body.college.id).toBe(testCollegeId);
      expect(response.body.plan.id).toBe(testPlanId);
    });

    it('Unknown subscription ID -> 404', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/11111111-1111-4111-a111-111111111111')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });

    it('Suspend subscription -> 200', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'SUSPENDED' })
        .expect(200);

      expect(response.body.status).toBe('SUSPENDED');

      // Verify AuditLog
      const logs = await prisma.auditLog.findMany({
        where: { targetId: subscriptionId, action: 'SUBSCRIPTION_UPDATED' },
      });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('Reactivate subscription -> 200', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'ACTIVE' })
        .expect(200);

      expect(response.body.status).toBe('ACTIVE');
    });

    it('Invalid UUID -> 400', async () => {
      await request(app.getHttpServer())
        .patch(`/subscriptions/invalid-uuid`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'ACTIVE' })
        .expect(400);
    });

    it('Invalid status -> 400', async () => {
      await request(app.getHttpServer())
        .patch(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'INVALID' })
        .expect(400);
    });
  });
});
