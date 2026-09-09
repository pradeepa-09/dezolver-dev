import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collegesApi } from '../collegesApi';
import { apiClient } from '@/lib/api/apiClient';

describe('collegesApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls GET /colleges for getColleges()', async () => {
    const mockGet = vi.spyOn(apiClient, 'get').mockResolvedValue([
      {
        id: 'col-1',
        name: 'MIT',
        domain: 'mit.edu',
        status: 'ACTIVE',
        createdAt: '2026-08-25T00:00:00.000Z',
        updatedAt: '2026-08-25T00:00:00.000Z',
      },
    ]);

    const result = await collegesApi.getColleges();

    expect(mockGet).toHaveBeenCalledWith('/colleges');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('MIT');
  });

  it('calls GET /colleges/:id for getCollege()', async () => {
    const mockGet = vi.spyOn(apiClient, 'get').mockResolvedValue({
      id: 'col-1',
      name: 'MIT',
      domain: 'mit.edu',
      status: 'ACTIVE',
      createdAt: '2026-08-25T00:00:00.000Z',
      updatedAt: '2026-08-25T00:00:00.000Z',
      users: [{ id: 'u-1', email: 'finance@mit.edu', role: 'ADMIN', isActive: true }],
    });

    const result = await collegesApi.getCollege('col-1');

    expect(mockGet).toHaveBeenCalledWith('/colleges/col-1');
    expect(result.users).toHaveLength(1);
  });

  it('calls POST /colleges for createCollege()', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      college: { id: 'col-2', name: 'Stanford', domain: 'stanford.edu', status: 'ACTIVE' },
      financeUser: { id: 'u-2', email: 'finance@stanford.edu', role: 'ADMIN' },
    });

    const result = await collegesApi.createCollege({ name: 'Stanford', domain: 'stanford.edu' });

    expect(mockPost).toHaveBeenCalledWith('/colleges', {
      name: 'Stanford',
      domain: 'stanford.edu',
    });
    expect(result.college.name).toBe('Stanford');
  });

  it('calls PATCH /colleges/:id for updateCollege()', async () => {
    const mockPatch = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      id: 'col-1',
      name: 'MIT Updated',
      domain: 'mit.edu',
      status: 'ACTIVE',
    });

    const result = await collegesApi.updateCollege('col-1', { name: 'MIT Updated' });

    expect(mockPatch).toHaveBeenCalledWith('/colleges/col-1', { name: 'MIT Updated' });
    expect(result.name).toBe('MIT Updated');
  });

  it('calls POST /colleges/:id/suspend for suspendCollege()', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      id: 'col-1',
      name: 'MIT',
      status: 'SUSPENDED',
    });

    const result = await collegesApi.suspendCollege('col-1');

    expect(mockPost).toHaveBeenCalledWith('/colleges/col-1/suspend', {});
    expect(result.status).toBe('SUSPENDED');
  });

  it('calls POST /colleges/:id/reactivate for reactivateCollege()', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      id: 'col-1',
      name: 'MIT',
      status: 'ACTIVE',
    });

    const result = await collegesApi.reactivateCollege('col-1');

    expect(mockPost).toHaveBeenCalledWith('/colleges/col-1/reactivate', {});
    expect(result.status).toBe('ACTIVE');
  });

  it('calls POST /colleges/:id/impersonate for impersonateCollege()', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      accessToken: 'impersonation-jwt',
      expiresIn: 3600,
      expiresAt: '2026-08-25T11:00:00.000Z',
      financeUser: { id: 'u-1', email: 'finance@mit.edu' },
    });

    const result = await collegesApi.impersonateCollege('col-1');

    expect(mockPost).toHaveBeenCalledWith('/colleges/col-1/impersonate', {});
    expect(result.accessToken).toBe('impersonation-jwt');
    expect(result.expiresIn).toBe(3600);
    expect(result.expiresAt).toBe('2026-08-25T11:00:00.000Z');
  });

  it('calls GET /colleges/:id/activity for getCollegeActivity()', async () => {
    const mockGet = vi.spyOn(apiClient, 'get').mockResolvedValue([
      {
        id: 'act-1',
        action: 'COLLEGE_CREATED',
        createdAt: '2026-08-25T10:00:00.000Z',
      },
    ]);

    const result = await collegesApi.getCollegeActivity('col-1');

    expect(mockGet).toHaveBeenCalledWith('/colleges/col-1/activity');
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('COLLEGE_CREATED');
  });

  it('calls POST /colleges/:id/impersonate-stop with tokenOverride', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true });

    const result = await collegesApi.impersonateStop('col-1', 'impersonation-jwt');

    expect(mockPost).toHaveBeenCalledWith(
      '/colleges/col-1/impersonate-stop',
      {},
      { tokenOverride: 'impersonation-jwt' },
    );
    expect(result.success).toBe(true);
  });
});
