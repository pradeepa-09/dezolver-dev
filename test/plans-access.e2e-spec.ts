/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Plans Access Control & Audit (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let superAdminToken = '';
  let adminToken = '';
  let userToken = '';

  let planId = '';

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

    const superAdmin = await prisma.user.upsert({
      where: { email: 'super-admin-access@dev.local' },
      update: {},
      create: {
        id: 'super-admin-access-id',
        email: 'super-admin-access@dev.local',
        password: 'test',
        role: 'SUPER_ADMIN',
      },
    });
    superAdminToken = jwtService.sign({
      sub: superAdmin.id,
      role: 'SUPER_ADMIN',
    });

    const financeAdmin = await prisma.user.upsert({
      where: { email: 'admin-access@dev.local' },
      update: {},
      create: {
        id: 'admin-access-id',
        email: 'admin-access@dev.local',
        password: 'test',
        role: 'ADMIN',
      },
    });
    adminToken = jwtService.sign({ sub: financeAdmin.id, role: 'ADMIN' });

    const standardUser = await prisma.user.upsert({
      where: { email: 'user-access@dev.local' },
      update: {},
      create: {
        id: 'user-access-id',
        email: 'user-access@dev.local',
        password: 'test',
        role: 'USER',
      },
    });
    userToken = jwtService.sign({ sub: standardUser.id, role: 'USER' });

    await prisma.auditLog.deleteMany({ where: { targetType: 'Plan' } });
    await prisma.planVersion.deleteMany();
    await prisma.plan.deleteMany();
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { targetType: 'Plan' } });
    await prisma.planVersion.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'super-admin-access@dev.local',
            'admin-access@dev.local',
            'user-access@dev.local',
          ],
        },
      },
    });
    await app.close();
  });

  describe('Standard USER Access', () => {
    it('should be forbidden from all Plan endpoints', async () => {
      await request(app.getHttpServer())
        .get('/plans')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      await request(app.getHttpServer())
        .get('/plans/dummy-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      await request(app.getHttpServer())
        .post('/plans')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
      await request(app.getHttpServer())
        .patch('/plans/dummy-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
      await request(app.getHttpServer())
        .patch('/plans/dummy-id/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('Finance Team (ADMIN) Access', () => {
    it('should be forbidden from write endpoints', async () => {
      await request(app.getHttpServer())
        .post('/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(403);
      await request(app.getHttpServer())
        .patch('/plans/dummy-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(403);
      await request(app.getHttpServer())
        .patch('/plans/dummy-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('SUPER_ADMIN Access & Audit Verification', () => {
    it('should create a plan', async () => {
      const res = await request(app.getHttpServer())
        .post('/plans')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Access Test Plan',
          description: 'Desc',
          price: 100,
          pricingMode: 'AUTOMATIC',
        })
        .expect(201);

      planId = res.body.id;
    });

    it('ADMIN should be able to read plans', async () => {
      const res = await request(app.getHttpServer())
        .get('/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);

      await request(app.getHttpServer())
        .get(`/plans/${planId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should verify PLAN_UPDATED and PLAN_VERSION_CREATED logs on update', async () => {
      await request(app.getHttpServer())
        .patch(`/plans/${planId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'Updated Plan', price: 200 })
        .expect(200);

      // Verify audit logs in DB
      const updatedLog = await prisma.auditLog.findFirst({
        where: { action: 'PLAN_UPDATED', targetId: planId },
        orderBy: { createdAt: 'desc' },
      });
      expect(updatedLog).toBeDefined();
      const upMeta: any = updatedLog?.metadata;
      expect(upMeta.oldValues.name).toBe('Access Test Plan');
      expect(upMeta.newValues.name).toBe('Updated Plan');

      const versionLog = await prisma.auditLog.findFirst({
        where: { action: 'PLAN_VERSION_CREATED', targetId: planId },
        orderBy: { createdAt: 'desc' },
      });
      expect(versionLog).toBeDefined();
      const verMeta: any = versionLog?.metadata;
      expect(verMeta.oldValues.price).toBe(100);
      expect(verMeta.newValues.price).toBe(200);
    });

    it('should verify PLAN_DEACTIVATED log on status change', async () => {
      await request(app.getHttpServer())
        .patch(`/plans/${planId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ isActive: false })
        .expect(200);

      const deactLog = await prisma.auditLog.findFirst({
        where: { action: 'PLAN_DEACTIVATED', targetId: planId },
        orderBy: { createdAt: 'desc' },
      });
      expect(deactLog).toBeDefined();
      expect((deactLog?.metadata as any).isActive).toBe(false);
    });

    it('should verify PLAN_ACTIVATED log on status change', async () => {
      await request(app.getHttpServer())
        .patch(`/plans/${planId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ isActive: true })
        .expect(200);

      const actLog = await prisma.auditLog.findFirst({
        where: { action: 'PLAN_ACTIVATED', targetId: planId },
        orderBy: { createdAt: 'desc' },
      });
      expect(actLog).toBeDefined();
      expect((actLog?.metadata as any).isActive).toBe(true);
    });
  });
});
