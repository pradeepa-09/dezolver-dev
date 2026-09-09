import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../authApi';
import { apiClient } from '@/lib/api/apiClient';

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('unwraps data envelope correctly on login', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      data: {
        accessToken: 'token-abc',
        user: {
          id: 'user-1',
          email: 'admin@dezolver.com',
          role: 'SUPER_ADMIN',
        },
      },
    });

    const result = await authApi.login({
      email: 'admin@dezolver.com',
      password: 'password123',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'admin@dezolver.com', password: 'password123' },
      { skipAuth: true },
    );
    expect(result.accessToken).toBe('token-abc');
    expect(result.user.email).toBe('admin@dezolver.com');
  });

  it('handles mfaRequired response on login', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      data: {
        mfaRequired: true,
        mfaToken: 'temp-mfa-jwt',
        user: {
          id: 'user-mfa',
          email: 'admin@dezolver.com',
          role: 'SUPER_ADMIN',
        },
      },
    });

    const result = await authApi.login({
      email: 'admin@dezolver.com',
      password: 'password123',
    });

    expect(result.mfaRequired).toBe(true);
    expect(result.mfaToken).toBe('temp-mfa-jwt');
    expect(result.user.id).toBe('user-mfa');
  });

  it('calls POST /auth/verify-otp with Bearer token in header and userId/otpCode in body', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      data: {
        accessToken: 'final-access-token',
        user: {
          id: 'user-mfa',
          email: 'admin@dezolver.com',
          role: 'SUPER_ADMIN',
        },
      },
    });

    const result = await authApi.verifyOtp({
      userId: 'user-mfa',
      otpCode: '123456',
      mfaToken: 'temp-mfa-jwt',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/verify-otp',
      {
        userId: 'user-mfa',
        otpCode: '123456',
      },
      {
        skipAuth: true,
        headers: {
          Authorization: 'Bearer temp-mfa-jwt',
        },
      },
    );
    expect(result.accessToken).toBe('final-access-token');
    expect(result.user.id).toBe('user-mfa');
  });

  it('calls POST /auth/mfa/setup and unwraps secret & qrCode', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      data: {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,...',
      },
    });

    const result = await authApi.setupMfa();

    expect(mockPost).toHaveBeenCalledWith('/auth/mfa/setup', {}, { skipAuth: false });
    expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(result.qrCode).toBe('data:image/png;base64,...');
  });

  it('calls POST /auth/mfa/enable with otpCode', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      data: {
        success: true,
      },
    });

    const result = await authApi.enableMfa('123456');

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/mfa/enable',
      { otpCode: '123456' },
      { skipAuth: false },
    );
    expect(result.success).toBe(true);
  });

  it('calls getHealth with skipAuth: true', async () => {
    const mockGet = vi.spyOn(apiClient, 'get').mockResolvedValue({
      status: 'ok',
      service: 'dezolver-backend',
    });

    const result = await authApi.getHealth();

    expect(mockGet).toHaveBeenCalledWith('/health', { skipAuth: true });
    expect(result.status).toBe('ok');
  });

  it('calls logout and swallows errors gracefully', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Network offline'));

    await expect(authApi.logout()).resolves.toBeUndefined();
    expect(mockPost).toHaveBeenCalledWith('/auth/logout', {}, { skipAuth: false });
  });
});
