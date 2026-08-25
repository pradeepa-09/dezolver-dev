import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  college: {
    count: jest.fn(),
  },
  user: {
    count: jest.fn(),
  },
  plan: {
    count: jest.fn(),
  },
  subscription: {
    count: jest.fn(),
  },
  auditLog: {
    findMany: jest.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlatformSummary', () => {
    it('should aggregate metrics and return platform summary safely', async () => {
      // Mock counts
      mockPrismaService.college.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8) // active
        .mockResolvedValueOnce(2); // suspended

      mockPrismaService.user.count
        .mockResolvedValueOnce(30) // total
        .mockResolvedValueOnce(2) // super_admin
        .mockResolvedValueOnce(10) // admin
        .mockResolvedValueOnce(18) // user
        .mockResolvedValueOnce(28); // active

      mockPrismaService.plan.count.mockResolvedValueOnce(4); // total plans

      mockPrismaService.subscription.count
        .mockResolvedValueOnce(12) // total
        .mockResolvedValueOnce(10); // active

      const sampleDate = new Date();
      mockPrismaService.auditLog.findMany.mockResolvedValueOnce([
        {
          id: 'audit-1',
          action: 'COLLEGE_CREATED',
          createdAt: sampleDate,
          targetId: 'col-1',
          targetType: 'College',
          metadata: { financeUserId: 'u-1' },
          actor: {
            id: 'actor-1',
            email: 'admin@dezolver.com',
            role: 'SUPER_ADMIN',
          },
        },
      ]);

      const result = await service.getPlatformSummary();

      expect(result).toEqual({
        colleges: {
          total: 10,
          active: 8,
          suspended: 2,
        },
        users: {
          total: 30,
          byRole: {
            superAdmin: 2,
            admin: 10,
            user: 18,
          },
          active: 28,
        },
        plans: {
          total: 4,
        },
        subscriptions: {
          total: 12,
          active: 10,
        },
        recentActivity: [
          {
            id: 'audit-1',
            action: 'COLLEGE_CREATED',
            createdAt: sampleDate,
            targetId: 'col-1',
            targetType: 'College',
            actor: {
              id: 'actor-1',
              email: 'admin@dezolver.com',
              role: 'SUPER_ADMIN',
            },
            metadata: { financeUserId: 'u-1' },
          },
        ],
      });
    });

    it('should return safe zero values when database is empty', async () => {
      mockPrismaService.college.count.mockResolvedValue(0);
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.plan.count.mockResolvedValue(0);
      mockPrismaService.subscription.count.mockResolvedValue(0);
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);

      const result = await service.getPlatformSummary();

      expect(result).toEqual({
        colleges: {
          total: 0,
          active: 0,
          suspended: 0,
        },
        users: {
          total: 0,
          byRole: {
            superAdmin: 0,
            admin: 0,
            user: 0,
          },
          active: 0,
        },
        plans: {
          total: 0,
        },
        subscriptions: {
          total: 0,
          active: 0,
        },
        recentActivity: [],
      });
    });
  });
});
