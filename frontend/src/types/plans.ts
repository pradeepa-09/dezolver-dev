/**
 * Subscription Plan Types mirroring backend Phase 7 contracts
 */

export interface PlanSubscriptionCollege {
  id: string;
  name: string;
  domain: string | null;
  status: string;
}

export interface PlanSubscription {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  collegeId: string;
  planId: string;
  college?: PlanSubscriptionCollege;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}

export interface PlanDetail extends Plan {
  subscriptions?: PlanSubscription[];
}

export interface CreatePlanDto {
  name: string;
  description?: string;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
}
