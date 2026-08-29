import { apiClient } from '@/lib/api/apiClient';
import type {
  College,
  CollegeDetail,
  CreateCollegeDto,
  UpdateCollegeDto,
  CreateCollegeResponse,
  ImpersonateResponse,
  ImpersonateStopResponse,
  CollegeActivityLog,
} from '@/types/colleges';

/**
 * Isolated API service for College Management
 * Connects to NestJS Backend endpoints through the shared apiClient.
 */
export const collegesApi = {
  /**
   * List all colleges: GET /colleges
   */
  async getColleges(): Promise<College[]> {
    return apiClient.get<College[]>('/colleges');
  },

  /**
   * Get single college details with users, subscriptions & activity: GET /colleges/:id
   */
  async getCollege(id: string): Promise<CollegeDetail> {
    return apiClient.get<CollegeDetail>(`/colleges/${encodeURIComponent(id)}`);
  },

  /**
   * Get college-specific activity/audit logs: GET /colleges/:id/activity
   */
  async getCollegeActivity(id: string): Promise<CollegeActivityLog[]> {
    return apiClient.get<CollegeActivityLog[]>(
      `/colleges/${encodeURIComponent(id)}/activity`,
    );
  },

  /**
   * Create college & auto-create Finance Team user: POST /colleges
   */
  async createCollege(dto: CreateCollegeDto): Promise<CreateCollegeResponse> {
    return apiClient.post<CreateCollegeResponse>('/colleges', dto);
  },

  /**
   * Update college name and/or domain: PATCH /colleges/:id
   */
  async updateCollege(
    id: string,
    dto: UpdateCollegeDto,
  ): Promise<College> {
    return apiClient.patch<College>(`/colleges/${encodeURIComponent(id)}`, dto);
  },

  /**
   * Suspend an active college: POST /colleges/:id/suspend
   */
  async suspendCollege(id: string): Promise<College> {
    return apiClient.post<College>(
      `/colleges/${encodeURIComponent(id)}/suspend`,
      {},
    );
  },

  /**
   * Reactivate a suspended college: POST /colleges/:id/reactivate
   */
  async reactivateCollege(id: string): Promise<College> {
    return apiClient.post<College>(
      `/colleges/${encodeURIComponent(id)}/reactivate`,
      {},
    );
  },

  /**
   * Start impersonation session as Finance Team (ADMIN): POST /colleges/:id/impersonate
   */
  async impersonateCollege(id: string): Promise<ImpersonateResponse> {
    return apiClient.post<ImpersonateResponse>(
      `/colleges/${encodeURIComponent(id)}/impersonate`,
      {},
    );
  },

  /**
   * End impersonation session: POST /colleges/:id/impersonate-stop
   * Requires Bearer impersonation token
   */
  async impersonateStop(
    id: string,
    impersonationToken: string,
  ): Promise<ImpersonateStopResponse> {
    return apiClient.post<ImpersonateStopResponse>(
      `/colleges/${encodeURIComponent(id)}/impersonate-stop`,
      {},
      { tokenOverride: impersonationToken },
    );
  },
};
