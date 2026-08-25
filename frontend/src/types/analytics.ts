/**
 * Platform Analytics Types mirroring backend Phase 8 contracts
 */

export interface AnalyticsActor {
  id: string;
  email: string;
  role: string;
}

export interface AnalyticsRecentActivity {
  id: string;
  action: string;
  createdAt: string;
  targetId: string | null;
  targetType: string | null;
  actor: AnalyticsActor | null;
  metadata: Record<string, unknown> | null;
}

export interface PlatformAnalytics {
  colleges: {
    total: number;
    active: number;
    suspended: number;
  };
  users: {
    total: number;
    byRole: {
      superAdmin: number;
      admin: number;
      user: number;
    };
    active: number;
  };
  plans: {
    total: number;
  };
  subscriptions: {
    total: number;
    active: number;
  };
  recentActivity: AnalyticsRecentActivity[];
}
