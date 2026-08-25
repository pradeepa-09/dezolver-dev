import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlatformAnalyticsPage } from '../PlatformAnalyticsPage';
import { analyticsApi } from '../../api/analyticsApi';
import type { PlatformAnalytics } from '@/types/analytics';

const mockAnalytics: PlatformAnalytics = {
  colleges: {
    total: 12,
    active: 10,
    suspended: 2,
  },
  users: {
    total: 45,
    byRole: {
      superAdmin: 3,
      admin: 12,
      user: 30,
    },
    active: 42,
  },
  plans: {
    total: 4,
  },
  subscriptions: {
    total: 10,
    active: 9,
  },
  recentActivity: [
    {
      id: 'audit-1',
      action: 'COLLEGE_CREATED',
      createdAt: '2026-08-25T12:00:00.000Z',
      targetId: 'col-1',
      targetType: 'College',
      actor: {
        id: 'u-1',
        email: 'superadmin@dezolver.com',
        role: 'SUPER_ADMIN',
      },
      metadata: null,
    },
  ],
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PlatformAnalyticsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all real metrics calculated from backend', async () => {
    vi.spyOn(analyticsApi, 'getPlatformAnalytics').mockResolvedValue(mockAnalytics);

    renderWithProviders(<PlatformAnalyticsPage />);

    expect(screen.getByText(/Loading Platform Intelligence/i)).toBeInTheDocument();

    await waitFor(() => {
      // Titles and cards
      expect(screen.getByText('Colleges')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Configured Plans')).toBeInTheDocument();
      expect(screen.getByText('Subscriptions')).toBeInTheDocument();

      // Multi-instance count elements
      expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('45')).toBeInTheDocument();

      // Roles
      expect(screen.getByText('Super Admins')).toBeInTheDocument();
      expect(screen.getByText('Admins (Finance)')).toBeInTheDocument();
      expect(screen.getByText('Regular Users')).toBeInTheDocument();

      // Recent activity
      expect(screen.getByText('COLLEGE_CREATED')).toBeInTheDocument();
      expect(screen.getByText('superadmin@dezolver.com')).toBeInTheDocument();
    });
  });

  it('handles empty / zero database state safely without crashing', async () => {
    const emptyAnalytics: PlatformAnalytics = {
      colleges: { total: 0, active: 0, suspended: 0 },
      users: {
        total: 0,
        byRole: { superAdmin: 0, admin: 0, user: 0 },
        active: 0,
      },
      plans: { total: 0 },
      subscriptions: { total: 0, active: 0 },
      recentActivity: [],
    };

    vi.spyOn(analyticsApi, 'getPlatformAnalytics').mockResolvedValue(emptyAnalytics);

    renderWithProviders(<PlatformAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No administrative audit records logged yet/i)).toBeInTheDocument();
      expect(screen.getByText('Super Admins')).toBeInTheDocument();
    });
  });

  it('renders ErrorState on network failure', async () => {
    vi.spyOn(analyticsApi, 'getPlatformAnalytics').mockRejectedValue(
      new Error('Failed to connect to backend server'),
    );

    renderWithProviders(<PlatformAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Platform Analytics')).toBeInTheDocument();
      expect(screen.getByText('Failed to connect to backend server')).toBeInTheDocument();
    });
  });
});
