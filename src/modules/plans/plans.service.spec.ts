import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  plan: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
};

describe('PlansService', () => {
  let service: PlansService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a plan and record an audit log', async () => {
      mockPrismaService.plan.findFirst.mockResolvedValue(null);
      const createdPlan = {
        id: 'plan-1',
        name: 'Enterprise Plan',
        description: 'Full tier',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.plan.create.mockResolvedValue(createdPlan);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-1' });

      const result = await service.create(
        { name: 'Enterprise Plan', description: 'Full tier' },
        'admin-user-id',
      );

      expect(mockPrismaService.plan.create).toHaveBeenCalledWith({
        data: {
          name: 'Enterprise Plan',
          description: 'Full tier',
        },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'PLAN_CREATED',
          actorId: 'admin-user-id',
          targetId: 'plan-1',
          targetType: 'Plan',
          metadata: {
            name: 'Enterprise Plan',
            description: 'Full tier',
          },
        },
      });
      expect(result).toEqual(createdPlan);
    });

    it('should throw ConflictException if plan name exists', async () => {
      mockPrismaService.plan.findFirst.mockResolvedValue({
        id: 'plan-existing',
        name: 'Enterprise Plan',
      });

      await expect(
        service.create({ name: 'Enterprise Plan' }, 'admin-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return list of plans with subscription count', async () => {
      const mockList = [
        { id: 'p1', name: 'Starter', _count: { subscriptions: 2 } },
      ];
      mockPrismaService.plan.findMany.mockResolvedValue(mockList);

      const result = await service.findAll();
      expect(result).toEqual(mockList);
      expect(mockPrismaService.plan.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { subscriptions: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a plan by id', async () => {
      const mockPlan = {
        id: 'p1',
        name: 'Starter',
        subscriptions: [],
        _count: { subscriptions: 0 },
      };
      mockPrismaService.plan.findUnique.mockResolvedValue(mockPlan);

      const result = await service.findOne('p1');
      expect(result).toEqual(mockPlan);
    });

    it('should throw NotFoundException if plan does not exist', async () => {
      mockPrismaService.plan.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a plan and record an audit log', async () => {
      const existingPlan = { id: 'p1', name: 'Starter', description: 'Old' };
      mockPrismaService.plan.findUnique.mockResolvedValue(existingPlan);
      mockPrismaService.plan.findFirst.mockResolvedValue(null);
      const updatedPlan = { id: 'p1', name: 'Starter Pro', description: 'New' };
      mockPrismaService.plan.update.mockResolvedValue(updatedPlan);
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-2' });

      const result = await service.update(
        'p1',
        { name: 'Starter Pro', description: 'New' },
        'admin-id',
      );

      expect(mockPrismaService.plan.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { name: 'Starter Pro', description: 'New' },
      });
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'PLAN_UPDATED',
          actorId: 'admin-id',
          targetId: 'p1',
          targetType: 'Plan',
          metadata: { name: 'Starter Pro', description: 'New' },
        },
      });
      expect(result).toEqual(updatedPlan);
    });

    it('should throw NotFoundException when updating non-existent plan', async () => {
      mockPrismaService.plan.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'Name' }, 'admin-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new name conflicts with another plan', async () => {
      mockPrismaService.plan.findUnique.mockResolvedValue({
        id: 'p1',
        name: 'Starter',
      });
      mockPrismaService.plan.findFirst.mockResolvedValue({
        id: 'p2',
        name: 'Pro',
      });

      await expect(
        service.update('p1', { name: 'Pro' }, 'admin-id'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
