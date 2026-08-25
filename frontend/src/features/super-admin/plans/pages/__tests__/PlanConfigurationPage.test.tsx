import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlanConfigurationPage } from '../PlanConfigurationPage';
import { plansApi } from '../../api/plansApi';
import type { Plan } from '@/types/plans';

const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Starter Plan',
    description: 'Basic institutional tier',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
    _count: { subscriptions: 3 },
  },
  {
    id: 'plan-2',
    name: 'Enterprise Plan',
    description: 'Full campus wide license',
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    _count: { subscriptions: 8 },
  },
];

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

describe('PlanConfigurationPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders plans list loaded from backend', async () => {
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue(mockPlans);

    renderWithProviders(<PlanConfigurationPage />);

    expect(screen.getByText(/Loading Subscription Plans/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Starter Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
      expect(screen.getByText('Basic institutional tier')).toBeInTheDocument();
    });
  });

  it('filters plans by search query', async () => {
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue(mockPlans);

    renderWithProviders(<PlanConfigurationPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Plan')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search plans by name/i);
    fireEvent.change(searchInput, { target: { value: 'enterprise' } });

    expect(screen.queryByText('Starter Plan')).not.toBeInTheDocument();
    expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
  });

  it('opens Create Plan modal, validates input, and submits', async () => {
    const user = userEvent.setup();
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue(mockPlans);
    const mockCreate = vi.spyOn(plansApi, 'createPlan').mockResolvedValue({
      id: 'plan-3',
      name: 'Custom Tier',
      description: 'Bespoke features',
      createdAt: '2026-08-25T11:00:00.000Z',
      updatedAt: '2026-08-25T11:00:00.000Z',
    });

    renderWithProviders(<PlanConfigurationPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Plan')).toBeInTheDocument();
    });

    // Open create modal
    await user.click(screen.getByRole('button', { name: /Create Plan/i }));
    expect(screen.getByText('Create Subscription Plan')).toBeInTheDocument();

    // Fill form
    await user.type(screen.getByLabelText(/Plan Name \*/i), 'Custom Tier');
    await user.type(
      screen.getByPlaceholderText(/Summary of plan entitlements/i),
      'Bespoke features',
    );

    // Submit
    const submitButtons = screen.getAllByRole('button', { name: /Create Plan/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Custom Tier',
        description: 'Bespoke features',
      });
      expect(screen.getByText(/Plan "Custom Tier" created successfully/i)).toBeInTheDocument();
    });
  });

  it('opens Edit Plan modal and updates plan', async () => {
    const user = userEvent.setup();
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue(mockPlans);
    const mockUpdate = vi.spyOn(plansApi, 'updatePlan').mockResolvedValue({
      ...mockPlans[0],
      name: 'Starter Plan v2',
    });

    renderWithProviders(<PlanConfigurationPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Plan')).toBeInTheDocument();
    });

    // Click edit on first plan
    const editButtons = screen.getAllByTitle('Edit Plan');
    await user.click(editButtons[0]);

    expect(screen.getByText('Edit Subscription Plan')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Plan Name \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Starter Plan v2');

    await user.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('plan-1', {
        name: 'Starter Plan v2',
        description: 'Basic institutional tier',
      });
      expect(screen.getByText(/Plan "Starter Plan v2" updated successfully/i)).toBeInTheDocument();
    });
  });

  it('opens Plan Details modal and renders details', async () => {
    const user = userEvent.setup();
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue(mockPlans);
    vi.spyOn(plansApi, 'getPlan').mockResolvedValue({
      ...mockPlans[0],
      subscriptions: [
        {
          id: 'sub-1',
          status: 'ACTIVE',
          createdAt: '2026-08-25T10:00:00.000Z',
          updatedAt: '2026-08-25T10:00:00.000Z',
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

    renderWithProviders(<PlanConfigurationPage />);

    await waitFor(() => {
      expect(screen.getByText('Starter Plan')).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByTitle('View Details');
    await user.click(detailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Subscribed Colleges (1)')).toBeInTheDocument();
      expect(screen.getByText('MIT')).toBeInTheDocument();
      expect(screen.getByText('mit.edu')).toBeInTheDocument();
    });
  });
});
