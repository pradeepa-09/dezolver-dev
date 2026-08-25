import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsApi } from '../analyticsApi';
import { apiClient } from '@/lib/api/apiClient';
import type { PlatformAnalytics } from '@/types/analytics';

describe('analyticsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls GET /analytics/platform for getPlatformAnalytics()', async () => {
    const mockData: PlatformAnalytics = {
      colleges: { total: 10, active: 8, suspended: 2 },
      users: {
        total: 25,
        byRole: { superAdmin: 2, admin: 8, user: 15 },
        active: 23,
      },
      plans: { total: 4 },
      subscriptions: { total: 8, active: 7 },
      recentActivity: [],
    };

    const mockGet = vi.spyOn(apiClient, 'get').mockResolvedValue(mockData);

    const result = await analyticsApi.getPlatformAnalytics();
    expect(mockGet).toHaveBeenCalledWith('/analytics/platform');
    expect(result).toEqual(mockData);
    expect(result.colleges.total).toBe(10);
  });
});
