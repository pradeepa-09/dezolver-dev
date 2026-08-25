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
