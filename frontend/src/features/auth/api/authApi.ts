import { apiClient } from '@/lib/api/apiClient';
import type {
  LoginCredentials,
  LoginResponseData,
  VerifyOtpPayload,
  MfaSetupResponse,
} from '@/types/auth';
import type { ApiResponse, HealthCheckResponse } from '@/types/api';

/**
 * Isolated authentication API service
 * Keeps backend endpoint contracts modular and aligned with backend auth routes.
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
      const data = response.data as LoginResponseData;
      return {
        ...data,
        mfaRequired: data.mfaRequired ?? data.requiresMfa,
        requiresMfa: data.mfaRequired ?? data.requiresMfa,
      };
    }

    const data = response as LoginResponseData;
    return {
      ...data,
      mfaRequired: data.mfaRequired ?? data.requiresMfa,
      requiresMfa: data.mfaRequired ?? data.requiresMfa,
    };
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
   * Submit MFA OTP code to POST /auth/verify-otp
   * Requires Bearer header with temporary mfaToken and body with { userId, otpCode }
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData> | LoginResponseData>(
      '/auth/verify-otp',
      {
        userId: payload.userId,
        otpCode: payload.otpCode,
      },
      {
        skipAuth: true,
        headers: {
          Authorization: `Bearer ${payload.mfaToken}`,
        },
      },
    );

    if ('data' in response && response.data && typeof response.data === 'object') {
      return response.data as LoginResponseData;
    }

    return response as LoginResponseData;
  },

  /**
   * Alias for verifyOtp
   */
  async verifyMfa(payload: VerifyOtpPayload): Promise<LoginResponseData> {
    return this.verifyOtp(payload);
  },

  /**
   * Initiate MFA setup for authenticated user: POST /auth/mfa/setup
   */
  async setupMfa(): Promise<MfaSetupResponse> {
    const response = await apiClient.post<ApiResponse<MfaSetupResponse> | MfaSetupResponse>(
      '/auth/mfa/setup',
      {},
      { skipAuth: false },
    );

    if ('data' in response && response.data && typeof response.data === 'object') {
      return response.data as MfaSetupResponse;
    }

    return response as MfaSetupResponse;
  },

  /**
   * Confirm and enable MFA for authenticated user: POST /auth/mfa/enable
   */
  async enableMfa(otpCode: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }> | { success: boolean }>(
      '/auth/mfa/enable',
      { otpCode },
      { skipAuth: false },
    );

    if ('data' in response && response.data && typeof response.data === 'object') {
      return response.data as { success: boolean };
    }

    return response as { success: boolean };
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
