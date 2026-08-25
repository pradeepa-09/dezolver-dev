import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiClient } from '../apiClient';
import { UnauthorizedError, ForbiddenError, ValidationError } from '../errors';

describe('ApiClient', () => {
  beforeEach(() => {
    apiClient.setAccessToken(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets and includes Bearer access token when available', async () => {
    apiClient.setAccessToken('test-access-token');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { ok: true } }),
    });
    globalThis.fetch = mockFetch;

    await apiClient.get('/test-endpoint');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchArgs = mockFetch.mock.calls[0];
    const headers = fetchArgs[1].headers;
    expect(headers['Authorization']).toBe('Bearer test-access-token');
    expect(fetchArgs[1].credentials).toBe('include');
  });

  it('omits Authorization header when skipAuth is true', async () => {
    apiClient.setAccessToken('test-access-token');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    });
    globalThis.fetch = mockFetch;

    await apiClient.get('/health', { skipAuth: true });

    const fetchArgs = mockFetch.mock.calls[0];
    const headers = fetchArgs[1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('throws UnauthorizedError on 401 when refresh fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Invalid credentials' }),
    });
    globalThis.fetch = mockFetch;

    await expect(apiClient.post('/auth/login', { email: 'a@b.com', password: '123' })).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it('throws ForbiddenError on 403 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ message: 'Access denied' }),
    });
    globalThis.fetch = mockFetch;

    await expect(apiClient.get('/super-admin/restricted')).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('throws ValidationError with formatted errors on 400 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        message: ['email must be an email', 'password is too short'],
        error: 'Bad Request',
        statusCode: 400,
      }),
    });
    globalThis.fetch = mockFetch;

    await expect(apiClient.post('/auth/login', {})).rejects.toThrow(ValidationError);
  });
});
