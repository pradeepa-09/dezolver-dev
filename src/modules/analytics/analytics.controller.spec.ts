import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

const mockAnalyticsService = {
  getPlatformSummary: jest.fn(),
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.getPlatformSummary', async () => {
    const summary = {
      colleges: { total: 1, active: 1, suspended: 0 },
      users: {
        total: 1,
        byRole: { superAdmin: 1, admin: 0, user: 0 },
        active: 1,
      },
      plans: { total: 1 },
      subscriptions: { total: 0, active: 0 },
      recentActivity: [],
    };
    mockAnalyticsService.getPlatformSummary.mockResolvedValue(summary);

    const result = await controller.getPlatformSummary();
    expect(mockAnalyticsService.getPlatformSummary).toHaveBeenCalled();
    expect(result).toEqual(summary);
  });
});
