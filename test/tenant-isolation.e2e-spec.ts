import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { College } from '@prisma/client';

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let collegeA: College;
  let collegeB: College;
  let adminAToken: string;
  let adminBToken: string;
  let superAdminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    prisma = app.get(PrismaService);
    await app.init();

    // Clean up
    await prisma.refreshSession.deleteMany({
      where: { user: { email: { contains: 'e2e-tenant' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e-tenant' } },
    });
    await prisma.college.deleteMany({
      where: { name: { contains: 'E2E Tenant' } },
    });

    // Seed Data
    collegeA = await prisma.college.create({
      data: { name: 'E2E Tenant College A' },
    });
    collegeB = await prisma.college.create({
      data: { name: 'E2E Tenant College B' },
    });

    const password = await bcrypt.hash('password123', 10);

    await prisma.user.create({
      data: {
        email: 'adminA@e2e-tenant.com',
        password,
        role: 'ADMIN',
        collegeId: collegeA.id,
        isActive: true,
      },
    });
    await prisma.user.create({
      data: {
        email: 'adminB@e2e-tenant.com',
        password,
        role: 'ADMIN',
        collegeId: collegeB.id,
        isActive: true,
      },
    });
    await prisma.user.create({
      data: {
        email: 'super@e2e-tenant.com',
        password,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    let res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'adminA@e2e-tenant.com', password: 'password123' });
    adminAToken = (res.body as { data: { accessToken: string } }).data
      .accessToken;

    res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'adminB@e2e-tenant.com', password: 'password123' });
    adminBToken = (res.body as { data: { accessToken: string } }).data
      .accessToken;

    res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'super@e2e-tenant.com', password: 'password123' });
    superAdminToken = (res.body as { data: { accessToken: string } }).data
      .accessToken;
  });

  afterAll(async () => {
    await prisma.refreshSession.deleteMany({
      where: { user: { email: { contains: 'e2e-tenant' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e-tenant' } },
    });
    await prisma.college.deleteMany({
      where: { name: { contains: 'E2E Tenant' } },
    });
    await app.close();
  });

  it('Admin A can access College A data (ALLOWED)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/colleges/${collegeA.id}`)
      .set('Authorization', `Bearer ${adminAToken}`);
    expect(res.status).toBe(200);
    expect((res.body as { id: string }).id).toBe(collegeA.id);
  });

  it('Admin A cannot access College B data (DENIED)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/colleges/${collegeB.id}`)
      .set('Authorization', `Bearer ${adminAToken}`);
    expect(res.status).toBe(404);
  });

  it('Admin B can access College B data (ALLOWED)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/colleges/${collegeB.id}`)
      .set('Authorization', `Bearer ${adminBToken}`);
    expect(res.status).toBe(200);
    expect((res.body as { id: string }).id).toBe(collegeB.id);
  });

  it('Admin B cannot access College A data (DENIED)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/colleges/${collegeA.id}`)
      .set('Authorization', `Bearer ${adminBToken}`);
    expect(res.status).toBe(404);
  });

  it('SUPER_ADMIN can access College A data (ALLOWED)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/colleges/${collegeA.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(res.status).toBe(200);
    expect((res.body as { id: string }).id).toBe(collegeA.id);
  });

  it('SUPER_ADMIN impersonating College A can access College A but not College B', async () => {
    // 1. Impersonate College A
    const impersonateRes = await request(app.getHttpServer())
      .post(`/colleges/${collegeA.id}/impersonate`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(impersonateRes.status).toBe(201);
    const impersonatedToken = (impersonateRes.body as { accessToken: string })
      .accessToken;

    // 2. Access College A (ALLOWED)
    const resA = await request(app.getHttpServer())
      .get(`/colleges/${collegeA.id}`)
      .set('Authorization', `Bearer ${impersonatedToken}`);
    expect(resA.status).toBe(200);
    expect((resA.body as { id: string }).id).toBe(collegeA.id);

    // 3. Access College B (DENIED)
    const resB = await request(app.getHttpServer())
      .get(`/colleges/${collegeB.id}`)
      .set('Authorization', `Bearer ${impersonatedToken}`);
    expect(resB.status).toBe(404);
  });
});
