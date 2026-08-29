import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlanConfigurationPage } from '../PlanConfigurationPage';
import { plansApi } from '../../api/plansApi';
import type { Plan } from '@/types/plans';

const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Basic',
    description: 'Basic institutional tier',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
    _count: { subscriptions: 3 },
  },
  {
    id: 'plan-2',
    name: 'Enterprise',
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

  it('renders all 3 tier cards and feature flag matrix', async () => {
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue(mockPlans);

    renderWithProviders(<PlanConfigurationPage />);

    expect(screen.getByText(/Loading Subscription Plans/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('₹499')).toBeInTheDocument();
      expect(screen.getByText('₹799')).toBeInTheDocument();
      expect(screen.getByText('₹1199')).toBeInTheDocument();
      expect(screen.getByText('Feature Flag Matrix')).toBeInTheDocument();
      expect(screen.getByText('Proctoring v2')).toBeInTheDocument();
      expect(screen.getByText('Analytics v3 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('AI Certificate Suggestions')).toBeInTheDocument();
    });
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
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    // Open create modal
    await user.click(screen.getByRole('button', { name: /Add New Plan/i }));
    expect(screen.getByRole('heading', { name: /Add New Plan/i })).toBeInTheDocument();

    // Fill form
    await user.type(screen.getByPlaceholderText(/e.g. Starter/i), 'Custom Tier');
    await user.type(screen.getByPlaceholderText(/e.g. 299/i), '499');

    // Submit
    const submitButtons = screen.getAllByRole('button', { name: /Create Plan/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Custom Tier',
        }),
      );
      expect(screen.getByText(/Plan "Custom Tier" created successfully/i)).toBeInTheDocument();
    });
  });

  it('opens Edit Plan modal and updates plan', async () => {
    const user = userEvent.setup();
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue(mockPlans);
    const mockUpdate = vi.spyOn(plansApi, 'updatePlan').mockResolvedValue({
      ...mockPlans[0],
      name: 'Basic v2',
    });

    renderWithProviders(<PlanConfigurationPage />);

    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    // Click edit on first plan
    const editButtons = screen.getAllByTitle('Edit Plan');
    await user.click(editButtons[0]);

    expect(screen.getByText('Edit Subscription Plan')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Plan Name \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Basic v2');

    await user.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('plan-1', {
        name: 'Basic v2',
        description: 'Basic institutional tier',
      });
      expect(screen.getByText(/Plan "Basic v2" updated successfully/i)).toBeInTheDocument();
    });
  });
});
