import { apiClient } from '@/lib/api/apiClient';
import type { PlatformAnalytics } from '@/types/analytics';

export const analyticsApi = {
  /**
   * Get real aggregated platform metrics for Super Admin
   */
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    return apiClient.get<PlatformAnalytics>('/analytics/platform');
  },
};
