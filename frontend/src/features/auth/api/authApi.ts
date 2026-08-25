import { apiClient } from '@/lib/api/apiClient';
import type {
  LoginCredentials,
  LoginResponseData,
} from '@/types/auth';
import type { ApiResponse, HealthCheckResponse } from '@/types/api';

/**
 * Isolated authentication API service
 * Keeps backend endpoint contracts modular and easy to adapt without touching UI components.
 */
export const authApi = {
  /**
   * Submit user credentials to POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData> | LoginResponseData>(
      '/auth/login',
      credentials,
      { skipAuth: true },
    );

    // Handle both wrapped ApiResponse envelope and direct payload shapes
    if ('data' in response && response.data && typeof response.data === 'object') {
      return response.data as LoginResponseData;
    }

    return response as LoginResponseData;
  },

  /**
   * Invalidate session on backend via POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {}, { skipAuth: false });
    } catch {
      // Gracefully ignore logout network/auth errors to ensure frontend state is always cleared
    }
  },

  /**
   * Placeholder for future MFA / OTP verification
   * (e.g. POST /auth/verify-otp)
   */
  async verifyOtp(payload: { otp: string; mfaToken?: string }): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData> | LoginResponseData>(
      '/auth/verify-otp',
      payload,
      { skipAuth: true },
    );

    if ('data' in response && response.data && typeof response.data === 'object') {
      return response.data as LoginResponseData;
    }

    return response as LoginResponseData;
  },

  /**
   * Health connectivity check: GET /health
   */
  async getHealth(): Promise<HealthCheckResponse> {
    return apiClient.get<HealthCheckResponse>('/health', {
      skipAuth: true,
    });
  },
};
