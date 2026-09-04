/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Plans Versioning (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let superAdminToken = '';
  const superAdminEmail = 'admin@dev.local';

  let planId = '';
  let collegeId = '';
  let subA_Id = '';
  let subB_Id = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    let superAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });
    if (!superAdmin) {
      superAdmin = await prisma.user.create({
        data: {
          id: 'super-admin-id',
          email: superAdminEmail,
          password: 'test',
          role: 'SUPER_ADMIN',
        },
      });
    }
    superAdminToken = jwtService.sign({
      sub: superAdmin.id,
      role: 'SUPER_ADMIN',
    });

    // Clean up if previous tests failed
    await prisma.auditLog.deleteMany({
      where: { targetType: 'Subscription' },
    });
    await prisma.subscription.deleteMany({
      where: { college: { name: 'Versioning E2E College' } },
    });
    await prisma.college.deleteMany({
      where: { name: 'Versioning E2E College' },
    });
    await prisma.planVersion.deleteMany({
      where: { plan: { name: 'V1 Plan' } },
    });
    await prisma.plan.deleteMany({
      where: { name: 'V1 Plan' },
    });

    const college = await prisma.college.create({
      data: { name: 'Versioning E2E College', domain: 'version-e2e.example.com', status: 'ACTIVE' },
    });
    collegeId = college.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.planVersion.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.college.deleteMany();
    await app.close();
  });

  it('1. Create a Plan (assert Version 1 exists)', async () => {
    const res = await request(app.getHttpServer())
      .post('/plans')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'V1 Plan',
        description: 'V1 Description',
        price: 1000,
        pricingMode: 'AUTOMATIC'
      })
      .expect(201);

    planId = res.body.id;

    // Assert Version 1 exists in DB
    const versions = await prisma.planVersion.findMany({ where: { planId } });
    expect(versions.length).toBe(1);
    expect(versions[0].version).toBe(1);
    expect(versions[0].price).toBe(1000);
  });

  it('2. Create Subscription A (assert it points to Version 1)', async () => {
    const res = await request(app.getHttpServer())
      .post('/subscriptions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ collegeId, planId })
      .expect(201);

    subA_Id = res.body.id;

    const sub = await prisma.subscription.findUnique({ where: { id: subA_Id }, include: { planVersion: true } });
    expect(sub?.planVersion.version).toBe(1);
    expect(sub?.planVersion.price).toBe(1000);
  });

  it('3. Change Plan price (assert Version 2 is created)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/plans/${planId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ price: 2000 })
      .expect(200);

    const versions = await prisma.planVersion.findMany({ where: { planId }, orderBy: { version: 'asc' } });
    expect(versions.length).toBe(2);
    expect(versions[1].version).toBe(2);
    expect(versions[1].price).toBe(2000);
  });

  it('4. Assert Subscription A still points to Version 1', async () => {
    const sub = await prisma.subscription.findUnique({ where: { id: subA_Id }, include: { planVersion: true } });
    expect(sub?.planVersion.version).toBe(1);
    expect(sub?.planVersion.price).toBe(1000); // Unchanged!
  });

  it('5. Create Subscription B (assert it points to Version 2)', async () => {
    // Suspend Subscription A first to avoid 409 Conflict (only one active subscription allowed per college)
    await request(app.getHttpServer())
      .patch(`/subscriptions/${subA_Id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post('/subscriptions')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ collegeId, planId })
      .expect(201);

    subB_Id = res.body.id;

    const sub = await prisma.subscription.findUnique({ where: { id: subB_Id }, include: { planVersion: true } });
    expect(sub?.planVersion.version).toBe(2);
    expect(sub?.planVersion.price).toBe(2000);
  });

  it('6. Verify Version 1 price is unchanged', async () => {
    const versions = await prisma.planVersion.findMany({ where: { planId }, orderBy: { version: 'asc' } });
    expect(versions[0].price).toBe(1000);
    expect(versions[1].price).toBe(2000);
  });
});
