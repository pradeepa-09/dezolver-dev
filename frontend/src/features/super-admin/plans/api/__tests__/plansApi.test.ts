import { describe, it, expect, vi, beforeEach } from 'vitest';
import { plansApi } from '../plansApi';
import { apiClient } from '@/lib/api/apiClient';

describe('plansApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls GET /plans for getPlans()', async () => {
    const mockGet = vi.spyOn(apiClient, 'get').mockResolvedValue([
      {
        id: 'plan-1',
        name: 'Starter Plan',
        description: 'Basic features',
        createdAt: '2026-08-25T00:00:00.000Z',
        updatedAt: '2026-08-25T00:00:00.000Z',
        _count: { subscriptions: 2 },
      },
    ]);

    const result = await plansApi.getPlans();
    expect(mockGet).toHaveBeenCalledWith('/plans');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Starter Plan');
  });

  it('calls GET /plans/:id for getPlan()', async () => {
    const mockGet = vi.spyOn(apiClient, 'get').mockResolvedValue({
      id: 'plan-1',
      name: 'Starter Plan',
      description: 'Basic features',
      createdAt: '2026-08-25T00:00:00.000Z',
      updatedAt: '2026-08-25T00:00:00.000Z',
      subscriptions: [
        {
          id: 'sub-1',
          status: 'ACTIVE',
          createdAt: '2026-08-25T00:00:00.000Z',
          updatedAt: '2026-08-25T00:00:00.000Z',
          collegeId: 'col-1',
          planId: 'plan-1',
          college: {
            id: 'col-1',
            name: 'MIT',
            domain: 'mit.edu',
            status: 'ACTIVE',
          },
        },
      ],
    });

    const result = await plansApi.getPlan('plan-1');
    expect(mockGet).toHaveBeenCalledWith('/plans/plan-1');
    expect(result.subscriptions).toHaveLength(1);
  });

  it('calls POST /plans for createPlan()', async () => {
    const mockPost = vi.spyOn(apiClient, 'post').mockResolvedValue({
      id: 'plan-2',
      name: 'Enterprise Plan',
      description: 'Full tier',
      createdAt: '2026-08-25T00:00:00.000Z',
      updatedAt: '2026-08-25T00:00:00.000Z',
    });

    const result = await plansApi.createPlan({
      name: 'Enterprise Plan',
      description: 'Full tier',
    });

    expect(mockPost).toHaveBeenCalledWith('/plans', {
      name: 'Enterprise Plan',
      description: 'Full tier',
    });
    expect(result.id).toBe('plan-2');
  });

  it('calls PATCH /plans/:id for updatePlan()', async () => {
    const mockPatch = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      id: 'plan-1',
      name: 'Starter Plan Updated',
      description: 'New features',
      createdAt: '2026-08-25T00:00:00.000Z',
      updatedAt: '2026-08-25T00:00:00.000Z',
    });

    const result = await plansApi.updatePlan('plan-1', {
      name: 'Starter Plan Updated',
    });

    expect(mockPatch).toHaveBeenCalledWith('/plans/plan-1', {
      name: 'Starter Plan Updated',
    });
    expect(result.name).toBe('Starter Plan Updated');
  });
});
