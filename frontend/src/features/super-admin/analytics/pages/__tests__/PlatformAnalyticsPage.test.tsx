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
  recentActivity: [],
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

  it('renders all charts, metrics, and engagement rankings', async () => {
    vi.spyOn(analyticsApi, 'getPlatformAnalytics').mockResolvedValue(mockAnalytics);

    renderWithProviders(<PlatformAnalyticsPage />);

    expect(screen.getByText(/Loading Platform Analytics/i)).toBeInTheDocument();

    await waitFor(() => {
      // Header & Subtitle
      expect(screen.getByText('Platform Analytics')).toBeInTheDocument();
      expect(screen.getByText(/Cross-tenant reporting/i)).toBeInTheDocument();

      // Time Range controls & Export button
      expect(screen.getByText('6M')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();

      // Main Analytics Grid Cards
      expect(screen.getByText('Monthly Recurring Revenue (₹)')).toBeInTheDocument();
      expect(screen.getByText('Active Colleges Over Time')).toBeInTheDocument();
      expect(screen.getByText('Enrollment Trend (All Colleges)')).toBeInTheDocument();
      expect(screen.getByText('Top Colleges by Engagement')).toBeInTheDocument();

      // Top Colleges names
      expect(screen.getByText('Clearwater University')).toBeInTheDocument();
      expect(screen.getByText('Eastbrook Engineering')).toBeInTheDocument();
      expect(screen.getByText('Westgate Polytechnic')).toBeInTheDocument();

      // Bottom KPI Cards
      expect(screen.getByText('AVG SEAT UTILIZATION')).toBeInTheDocument();
      expect(screen.getByText('73%')).toBeInTheDocument();
      expect(screen.getByText('AVG HEALTH SCORE')).toBeInTheDocument();
      expect(screen.getByText('71.2')).toBeInTheDocument();
      expect(screen.getByText('TOTAL ASSESSMENTS TAKEN')).toBeInTheDocument();
      expect(screen.getByText('1.2M')).toBeInTheDocument();
      expect(screen.getByText('CERTIFICATES ISSUED')).toBeInTheDocument();
      expect(screen.getByText('8,420')).toBeInTheDocument();
    });
  });

  it('renders ErrorState on network failure with retry action', async () => {
    vi.spyOn(analyticsApi, 'getPlatformAnalytics').mockRejectedValue(
      new Error('Failed to connect to backend server'),
    );

    renderWithProviders(<PlatformAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Platform Analytics')).toBeInTheDocument();
      expect(screen.getByText('Failed to connect to backend server')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });
  });
});
