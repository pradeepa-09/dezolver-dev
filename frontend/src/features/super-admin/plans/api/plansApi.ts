import { apiClient } from '@/lib/api/apiClient';
import type { Plan, PlanDetail, CreatePlanDto, UpdatePlanDto } from '@/types/plans';

export const plansApi = {
  /**
   * List all subscription plans
   */
  async getPlans(): Promise<Plan[]> {
    return apiClient.get<Plan[]>('/plans');
  },

  /**
   * Get single plan by ID including subscriptions and college counts
   */
  async getPlan(id: string): Promise<PlanDetail> {
    return apiClient.get<PlanDetail>(`/plans/${id}`);
  },

  /**
   * Create a new subscription plan
   */
  async createPlan(dto: CreatePlanDto): Promise<Plan> {
    return apiClient.post<Plan>('/plans', dto);
  },

  /**
   * Update an existing subscription plan
   */
  async updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
    return apiClient.patch<Plan>(`/plans/${id}`, dto);
  },
};
