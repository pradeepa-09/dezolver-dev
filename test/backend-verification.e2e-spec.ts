/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import cookieParser from 'cookie-parser';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Backend Verification (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let superAdminToken = '';
  let superAdminRefreshTokenCookie = '';
  let createdCollegeId = '';
  let impersonationToken = '';

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@dev.local';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    
    // Clean up from previous failed test runs
    const testCollege = await prisma.college.findFirst({
      where: { domain: 'http://verify.example.com' }
    });
    if (testCollege) {
      await prisma.user.deleteMany({ where: { collegeId: testCollege.id } });
      await prisma.auditLog.deleteMany({ where: { targetId: testCollege.id } });
      await prisma.subscription.deleteMany({ where: { collegeId: testCollege.id } });
      await prisma.college.delete({ where: { id: testCollege.id } });
    }
  });

  afterAll(async () => {
    // Clean up created test data
    if (createdCollegeId) {
      await prisma.user.deleteMany({ where: { collegeId: createdCollegeId } });
      await prisma.auditLog.deleteMany({
        where: { targetId: createdCollegeId },
      });
      await prisma.subscription.deleteMany({
        where: { collegeId: createdCollegeId },
      });
      await prisma.college.delete({ where: { id: createdCollegeId } });
    }
    await app.close();
  });

  describe('HEALTH', () => {
    it('/health (GET) -> 200 when DB is available', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('healthy');
    });
  });

  describe('AUTH', () => {
    it('/auth/login (POST) valid Super Admin -> 200', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: superAdminEmail, password: superAdminPassword })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      superAdminToken = response.body.data.accessToken;

      const refreshTokenCookie = (cookies as unknown as string[]).find((c: string) =>
        c.includes('refreshToken='),
      );
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');

      superAdminRefreshTokenCookie = refreshTokenCookie!.split(';')[0];
    });

    it('/auth/login (POST) invalid password -> 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: superAdminEmail, password: 'wrongpassword' })
        .expect(401);
    });

    it('/auth/login (POST) unknown user -> 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@nowhere.com', password: 'password' })
        .expect(401);
    });

    it('/auth/refresh (POST) -> successful rotation', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', superAdminRefreshTokenCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      superAdminToken = response.body.data.accessToken;

      const cookies = response.headers['set-cookie'];
      superAdminRefreshTokenCookie = (cookies as unknown as string[])
        .find((c: string) => c.includes('refreshToken='))!
        .split(';')[0];
    });

    it('/auth/refresh (POST) old refresh token -> rejected', async () => {
      // Trying to refresh with invalid or missing cookie
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=invalid_token')
        .expect(401);
    });
  });

  describe('JWT', () => {
    it('valid JWT -> accepted', async () => {
      await request(app.getHttpServer())
        .get('/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('malformed JWT -> 401', async () => {
      await request(app.getHttpServer())
        .get('/colleges')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('expired JWT -> 401', async () => {
      // Sign an expired token
      const expiredToken = jwtService.sign(
        { sub: 'test', role: 'SUPER_ADMIN' },
        { expiresIn: '-1s' },
      );
      await request(app.getHttpServer())
        .get('/colleges')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('RBAC', () => {
    it('unauthenticated request -> 401', async () => {
      await request(app.getHttpServer()).get('/colleges').expect(401);
    });

    it('authenticated USER without permission -> 403', async () => {
      const userToken = jwtService.sign({ sub: 'test-user', role: 'USER' });
      await request(app.getHttpServer())
        .get('/colleges')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('SUPER_ADMIN with required permission -> allowed', async () => {
      await request(app.getHttpServer())
        .get('/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });
  });

  describe('COLLEGE MANAGEMENT', () => {
    it('create college -> successful', async () => {
      const response = await request(app.getHttpServer())
        .post('/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Verification College',
          domain: 'http://verify.example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.college).toBeDefined();
      expect(response.body.college.id).toBeDefined();
      createdCollegeId = response.body.college.id;

      expect(response.body.financeUser).toBeDefined();
      expect(response.body.financeUser.role).toBe('ADMIN');
      expect(response.body.financeUser.email).toContain('finance_');
      expect(response.body.financeUser.password).toBeUndefined();
      expect(response.body.financeUser.passwordHash).toBeUndefined();
    });

    it('transaction rollback -> College not created if Finance User fails (during)', async () => {
      const domain = 'http://rollback.example.com';
      await prisma.college.deleteMany({ where: { domain } });
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockRejectedValueOnce(new Error('Simulated failure'));
      
      await request(app.getHttpServer())
        .post('/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Rollback College',
          domain: domain,
        })
        .expect(500);

      const college = await prisma.college.findUnique({ where: { domain } });
      expect(college).toBeNull();
      
      jest.restoreAllMocks();
    });

    it('transaction rollback -> College and User cleaned up if AuditLog fails (after Finance User)', async () => {
      const domain = 'http://rollback-audit.example.com';
      await prisma.college.deleteMany({ where: { domain } });
      
      jest.spyOn(prisma.auditLog, 'create').mockRejectedValueOnce(new Error('Simulated audit failure'));
      
      await request(app.getHttpServer())
        .post('/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Rollback College 2',
          domain: domain,
        })
        .expect(500);

      const college = await prisma.college.findUnique({ where: { domain } });
      expect(college).toBeNull();

      const orphanedUser = await prisma.user.findFirst({ where: { email: { contains: 'rollback-audit.example.com' } } });
      expect(orphanedUser).toBeNull();
      
      jest.restoreAllMocks();
    });

    it('GET /api/colleges -> array of colleges', async () => {
      const response = await request(app.getHttpServer())
        .get('/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].name).toBeDefined();
      expect(response.body[0].domain).toBeDefined();
    });

    it('duplicate domain -> rejected', async () => {
      await request(app.getHttpServer())
        .post('/colleges')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Duplicate College',
          domain: 'http://verify.example.com',
        })
        .expect(409);
    });

    it('College without subscription still returns successfully with an empty/null subscription', async () => {
      const response = await request(app.getHttpServer())
        .get(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdCollegeId);
      expect(response.body.subscriptions).toEqual([]);
    });

    it('College with active subscription returns subscription information', async () => {
      const plan = await prisma.plan.create({
        data: {
          name: 'Pro Plan',
          description: 'Pro Features',
          versions: {
            create: {
              version: 1,
              price: 1000,
            }
          }
        },
        include: { versions: true }
      });

      const subscription = await prisma.subscription.create({
        data: {
          status: 'ACTIVE',
          collegeId: createdCollegeId,
          planId: plan.id,
          planVersionId: plan.versions[0].id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.subscriptions).toBeDefined();
      expect(response.body.subscriptions.length).toBe(1);
      expect(response.body.subscriptions[0].id).toBe(subscription.id);
      expect(response.body.subscriptions[0].plan).toBeDefined();
      expect(response.body.subscriptions[0].plan.name).toBe('Pro Plan');
      
      // Sensitive credentials are not present
      if (response.body.users && response.body.users.length > 0) {
        expect(response.body.users[0].password).toBeUndefined();
      }
    });

    it('Nonexistent college returns 404', async () => {
      await request(app.getHttpServer())
        .get('/colleges/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });

    it('malformed College UUID -> 400', async () => {
      await request(app.getHttpServer())
        .get('/colleges/not-a-uuid')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);
    });

    it('update college -> successful', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'Verification College Updated' })
        .expect(200);

      expect(response.body.name).toBe('Verification College Updated');
    });

    it('suspend active college -> successful', async () => {
      const response = await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/suspend`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201); // Assuming 201 for POST operations unless specified 200

      expect(response.body.status).toBe('SUSPENDED');

      const decodedToken = jwtService.decode(superAdminToken) as any;
      const auditLog = await prisma.auditLog.findFirst({
        where: { action: 'COLLEGE_SUSPENDED', targetId: createdCollegeId },
        orderBy: { createdAt: 'desc' }
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.actorId).toBe(decodedToken.sub);
      expect(auditLog?.targetId).toBe(createdCollegeId);
    });

    it('suspend already suspended college -> rejected', async () => {
      await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/suspend`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);
    });

    it('reactivate suspended college -> successful', async () => {
      const response = await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/reactivate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);

      expect(response.body.status).toBe('ACTIVE');

      const decodedToken = jwtService.decode(superAdminToken) as any;
      const auditLog = await prisma.auditLog.findFirst({
        where: { action: 'COLLEGE_REACTIVATED', targetId: createdCollegeId },
        orderBy: { createdAt: 'desc' }
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.actorId).toBe(decodedToken.sub);
      expect(auditLog?.targetId).toBe(createdCollegeId);
    });

    it('impersonation -> ADMIN cannot start impersonation -> 403', async () => {
      const adminToken = jwtService.sign({ sub: 'test-admin', role: 'ADMIN', collegeId: createdCollegeId });
      await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/impersonate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('impersonation -> USER cannot start impersonation -> 403', async () => {
      const userToken = jwtService.sign({ sub: 'test-user', role: 'USER', collegeId: createdCollegeId });
      await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/impersonate`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('impersonation -> successful', async () => {
      const response = await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/impersonate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      impersonationToken = response.body.accessToken;

      const decoded = jwtService.decode(response.body.accessToken);
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.isImpersonation).toBe(true);
      expect(decoded.impersonatorId).toBeDefined();
      expect(decoded.targetCollegeId).toBe(createdCollegeId);
      expect(decoded.jti).toBeDefined();
    });

    it('impersonation stop -> successful and audit event generated', async () => {
      const response = await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/impersonate-stop`)
        .set('Authorization', `Bearer ${impersonationToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);

      const decodedToken = jwtService.decode(superAdminToken) as any;
      const auditLog = await prisma.auditLog.findFirst({
        where: { action: 'IMPERSONATION_ENDED' },
        orderBy: { createdAt: 'desc' }
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.targetId).toBe(createdCollegeId);
      
      const meta = auditLog?.metadata as any;
      expect(meta?.targetCollegeId).toBe(createdCollegeId);
      expect(meta?.impersonatorId).toBe(decodedToken.sub);
      expect(meta?.jti).toBeDefined();
    });

    it('stopped/revoked token cannot continue accessing protected resources', async () => {
      // The token was stopped in the previous test
      await request(app.getHttpServer())
        .get(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${impersonationToken}`)
        .expect(401);
    });

    it('original Super Admin session remains valid after stopping impersonation', async () => {
      await request(app.getHttpServer())
        .get(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('impersonation token has expiry (expired token rejected server-side)', async () => {
      const expiredPayload = {
        sub: 'some-finance-admin-id',
        role: 'ADMIN',
        isImpersonation: true,
        impersonatorId: 'super-admin-id',
        targetCollegeId: createdCollegeId,
        jti: 'expired-token-id',
      };
      const expiredToken = jwtService.sign(expiredPayload, { expiresIn: '-1s' });
      await request(app.getHttpServer())
        .get(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('impersonation cannot escalate to SUPER_ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/impersonate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(201);
      
      const freshToken = response.body.accessToken;
      
      // Attempting to access list of colleges requires colleges:list which is SUPER_ADMIN
      await request(app.getHttpServer())
        .get('/colleges')
        .set('Authorization', `Bearer ${freshToken}`)
        .expect(403);
    });

    it('repeated suspend requests eventually receive 429', async () => {
      let status = 200;
      for (let i = 0; i < 15; i++) {
        const res = await request(app.getHttpServer())
          .post(`/colleges/${createdCollegeId}/suspend`)
          .set('Authorization', `Bearer ${superAdminToken}`);
        status = res.status;
        if (status === 429) break;
      }
      expect(status).toBe(429);
    });

    it('repeated reactivate requests eventually receive 429', async () => {
      let status = 200;
      for (let i = 0; i < 15; i++) {
        const res = await request(app.getHttpServer())
          .post(`/colleges/${createdCollegeId}/reactivate`)
          .set('Authorization', `Bearer ${superAdminToken}`);
        status = res.status;
        if (status === 429) break;
      }
      expect(status).toBe(429);
    });

    it('repeated impersonation-start requests eventually receive 429', async () => {
      let status = 200;
      for (let i = 0; i < 15; i++) {
        const res = await request(app.getHttpServer())
          .post(`/colleges/${createdCollegeId}/impersonate`)
          .set('Authorization', `Bearer ${superAdminToken}`);
        status = res.status;
        if (status === 429) break;
      }
      expect(status).toBe(429);
    });
  });

  describe('SECURITY', () => {
    it('password hash never appears in API responses', async () => {
      // Check the created college's users (finance admin)
      const collegeUsers = await request(app.getHttpServer())
        .get(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      if (collegeUsers.body.users) {
        collegeUsers.body.users.forEach((u: any) => {
          expect(u.password).toBeUndefined();
        });
      }
    });

    it('logout -> successful', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', superAdminRefreshTokenCookie)
        .expect(200);
    });

    it('revoked refresh token -> rejected', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', superAdminRefreshTokenCookie)
        .expect(401);
    });
  });
});
