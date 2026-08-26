import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { apiClient } from '@/lib/api/apiClient';
import { authApi } from '@/features/auth/api/authApi';
import { collegesApi } from '@/features/super-admin/colleges/api/collegesApi';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errors';
import type { College, CreateCollegeResponse } from '@/types/colleges';

describe('Real Backend ↔ Frontend Full Verification Suite', () => {
  let superAdminToken: string;
  let createdCollege: College;
  let financeUserEmail: string;
  let financeToken: string;

  // Emulate browser cookie jar for Node.js environment
  const cookieJar: Record<string, string> = {};
  const originalFetch = globalThis.fetch;

  beforeAll(() => {
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (init?.credentials === 'include' || !init?.credentials) {
        const cookieHeader = Object.entries(cookieJar)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
        if (cookieHeader) {
          headers.set('cookie', cookieHeader);
        }
      }

      const response = await originalFetch(input, {
        ...init,
        headers,
      });

      const rawSetCookie = response.headers.get('set-cookie');
      if (rawSetCookie) {
        const match = rawSetCookie.match(/^([^=]+)=([^;]+)/);
        if (match) {
          const cookieName = match[1].trim();
          const cookieVal = match[2].trim();
          if (cookieVal && !rawSetCookie.includes('Expires=Thu, 01 Jan 1970')) {
            cookieJar[cookieName] = cookieVal;
          } else {
            delete cookieJar[cookieName];
          }
        }
      }

      return response;
    };

    apiClient.setAccessToken(null);
  });

  afterAll(async () => {
    globalThis.fetch = originalFetch;
    apiClient.setAccessToken(null);
  });

  describe('2. Authentication Integration Verification', () => {
    it('successfully logs in with real Super Admin credentials against POST /api/auth/login', async () => {
      const loginResult = await authApi.login({
        email: 'admin@dev.local',
        password: 'change_me_locally',
      });

      expect(loginResult).toBeDefined();
      expect(loginResult.accessToken).toBeDefined();
      expect(loginResult.user).toBeDefined();
      expect(loginResult.user.email).toBe('admin@dev.local');
      expect(loginResult.user.role).toBe('SUPER_ADMIN');

      superAdminToken = loginResult.accessToken || '';
      apiClient.setAccessToken(superAdminToken);
    });

    it('rejects invalid credentials with real 401 Unauthorized', async () => {
      await expect(
        authApi.login({
          email: 'admin@dev.local',
          password: 'wrong_password_123',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('6. College Management API & Lifecycle Verification', () => {
    const testDomain = `test-${Date.now()}.edu`;

    it('creates a new college via POST /api/colleges and returns auto-provisioned Finance user', async () => {
      const response: CreateCollegeResponse = await collegesApi.createCollege({
        name: 'MIT Technology Institute',
        domain: testDomain,
      });

      expect(response).toBeDefined();
      expect(response.college).toBeDefined();
      expect(response.college.id).toBeDefined();
      expect(response.college.name).toBe('MIT Technology Institute');
      expect(response.college.domain).toBe(testDomain);
      expect(response.college.status).toBe('ACTIVE');

      expect(response.financeUser).toBeDefined();
      expect(response.financeUser.role).toBe('ADMIN');
      expect(response.financeUser.email).toContain('finance_');

      createdCollege = response.college;
      financeUserEmail = response.financeUser?.email || '';
    });

    it('loads college list via GET /api/colleges and finds created college', async () => {
      const colleges = await collegesApi.getColleges();
      expect(Array.isArray(colleges)).toBe(true);
      const found = colleges.find((c) => c.id === createdCollege.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('MIT Technology Institute');
    });

    it('loads single college details with users via GET /api/colleges/:id', async () => {
      const details = await collegesApi.getCollege(createdCollege.id);
      expect(details).toBeDefined();
      expect(details.id).toBe(createdCollege.id);
      expect(details.name).toBe('MIT Technology Institute');
      expect(Array.isArray(details.users)).toBe(true);
      expect(details.users.some((u) => u.email === financeUserEmail)).toBe(true);
    });

    it('updates college name via PATCH /api/colleges/:id', async () => {
      const updated = await collegesApi.updateCollege(createdCollege.id, {
        name: 'MIT School of Engineering',
      });
      expect(updated.id).toBe(createdCollege.id);
      expect(updated.name).toBe('MIT School of Engineering');
    });

    it('suspends college via POST /api/colleges/:id/suspend', async () => {
      const suspended = await collegesApi.suspendCollege(createdCollege.id);
      expect(suspended.id).toBe(createdCollege.id);
      expect(suspended.status).toBe('SUSPENDED');
    });

    it('reactivates college via POST /api/colleges/:id/reactivate', async () => {
      const reactivated = await collegesApi.reactivateCollege(createdCollege.id);
      expect(reactivated.id).toBe(createdCollege.id);
      expect(reactivated.status).toBe('ACTIVE');
    });

    it('starts impersonation session via POST /api/colleges/:id/impersonate', async () => {
      const impersonateRes = await collegesApi.impersonateCollege(createdCollege.id);
      expect(impersonateRes).toBeDefined();
      expect(impersonateRes.accessToken).toBeDefined();
      expect(impersonateRes.financeUser).toBeDefined();
      expect(impersonateRes.financeUser.email).toBe(financeUserEmail);

      financeToken = impersonateRes.accessToken;
    });

    it('ends impersonation session via POST /api/colleges/:id/impersonate-stop', async () => {
      const stopRes = await collegesApi.impersonateStop(
        createdCollege.id,
        financeToken,
      );
      expect(stopRes).toBeDefined();
      expect(stopRes.success).toBe(true);
    });
  });

  describe('3 & 4. Refresh Token & Real 401 Flow Verification', () => {
    it('acquires fresh access token using HttpOnly cookie via POST /api/auth/refresh', async () => {
      // Clear in-memory token to simulate token loss/expiry
      apiClient.setAccessToken(null);

      // Explicitly trigger refresh
      const refreshedToken = await apiClient.refreshAccessToken();
      expect(refreshedToken).toBeTruthy();
      expect(typeof refreshedToken).toBe('string');
      expect(apiClient.getAccessToken()).toBe(refreshedToken);
    });

    it('automatically recovers and retries request when access token is invalid/null', async () => {
      // Set an invalid token
      apiClient.setAccessToken('invalid.token.structure');

      // Attempt authenticated request - apiClient catches 401, calls handleTokenRefresh(), and retries!
      const colleges = await collegesApi.getColleges();
      expect(Array.isArray(colleges)).toBe(true);
      expect(apiClient.getAccessToken()).toBeTruthy();
      expect(apiClient.getAccessToken()).not.toBe('invalid.token.structure');
    });
  });

  describe('5. Real 403 Forbidden Handling Verification', () => {
    it('returns 403 Forbidden when a non-super-admin user (impersonated Finance Admin) accesses Super Admin route without refreshing loop', async () => {
      // Attempt to access a Super Admin endpoint using the Finance Admin token
      await expect(
        apiClient.get('/colleges', { tokenOverride: financeToken }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('Logout & Teardown Verification', () => {
    it('successfully calls POST /api/auth/logout and invalidates refresh session', async () => {
      await authApi.logout();
      apiClient.setAccessToken(null);

      // Calling refresh now should fail because refresh cookie was cleared
      const refreshed = await apiClient.refreshAccessToken();
      expect(refreshed).toBeNull();
    });

    it('blocks unauthenticated requests with 401 after logout', async () => {
      apiClient.setAccessToken(null);
      await expect(collegesApi.getColleges()).rejects.toThrow(UnauthorizedError);
    });
  });
});
