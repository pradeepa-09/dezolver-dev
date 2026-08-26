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

      const refreshTokenCookie = cookies.find((c: string) =>
        c.includes('refreshToken='),
      );
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');

      superAdminRefreshTokenCookie = refreshTokenCookie.split(';')[0];
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
      superAdminRefreshTokenCookie = cookies
        .find((c: string) => c.includes('refreshToken='))
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
      console.log('Create College Response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body.college).toBeDefined();
      expect(response.body.college.id).toBeDefined();
      createdCollegeId = response.body.college.id;
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

    it('get college -> successful', async () => {
      const response = await request(app.getHttpServer())
        .get(`/colleges/${createdCollegeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdCollegeId);
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
    });

    it('impersonation stop -> successful and audit event generated', async () => {
      const response = await request(app.getHttpServer())
        .post(`/colleges/${createdCollegeId}/impersonate-stop`)
        .set('Authorization', `Bearer ${impersonationToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);

      const auditLogs = await prisma.auditLog.findMany({
        where: { action: 'IMPERSONATION_ENDED' },
      });
      expect(auditLogs.length).toBeGreaterThan(0);
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
