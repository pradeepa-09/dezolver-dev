import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CollegeManagementPage } from '../CollegeManagementPage';
import { ImpersonationProvider } from '../../context/ImpersonationContext';
import { collegesApi } from '../../api/collegesApi';
import type { College } from '@/types/colleges';

const mockColleges: College[] = [
  {
    id: 'col-1',
    name: 'Harvard University',
    domain: 'harvard.edu',
    status: 'ACTIVE',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
  },
  {
    id: 'col-2',
    name: 'Oxford College',
    domain: 'oxford.ac.uk',
    status: 'SUSPENDED',
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
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
      <ImpersonationProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ImpersonationProvider>
    </QueryClientProvider>,
  );
}

describe('CollegeManagementPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and displays list of colleges from backend', async () => {
    vi.spyOn(collegesApi, 'getColleges').mockResolvedValue(mockColleges);

    renderWithProviders(<CollegeManagementPage />);

    expect(screen.getByText(/Loading College Directory/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Harvard University')).toBeInTheDocument();
      expect(screen.getByText('Oxford College')).toBeInTheDocument();
      expect(screen.getByText('harvard.edu')).toBeInTheDocument();
    });
  });

  it('filters colleges client-side by status tab', async () => {
    const user = userEvent.setup();
    vi.spyOn(collegesApi, 'getColleges').mockResolvedValue(mockColleges);

    renderWithProviders(<CollegeManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Harvard University')).toBeInTheDocument();
    });

    // Filter by Active status
    await user.click(screen.getByRole('button', { name: /Active \(1\)/i }));
    expect(screen.getByText('Harvard University')).toBeInTheDocument();
    expect(screen.queryByText('Oxford College')).not.toBeInTheDocument();

    // Filter by Suspended status
    await user.click(screen.getByRole('button', { name: /Suspended \(1\)/i }));
    expect(screen.queryByText('Harvard University')).not.toBeInTheDocument();
    expect(screen.getByText('Oxford College')).toBeInTheDocument();
  });

  it('filters colleges client-side by search query', async () => {
    vi.spyOn(collegesApi, 'getColleges').mockResolvedValue(mockColleges);

    renderWithProviders(<CollegeManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Harvard University')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by college name or domain/i);
    fireEvent.change(searchInput, { target: { value: 'harvard' } });

    expect(screen.getByText('Harvard University')).toBeInTheDocument();
    expect(screen.queryByText('Oxford College')).not.toBeInTheDocument();
  });

  it('opens confirmation modal and suspends an active college', async () => {
    const user = userEvent.setup();
    vi.spyOn(collegesApi, 'getColleges').mockResolvedValue(mockColleges);
    const mockSuspend = vi.spyOn(collegesApi, 'suspendCollege').mockResolvedValue({
      ...mockColleges[0],
      status: 'SUSPENDED',
    });

    renderWithProviders(<CollegeManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Harvard University')).toBeInTheDocument();
    });

    // Click Suspend on Harvard
    await user.click(screen.getByTitle('Suspend College'));

    // Confirmation dialog appears
    expect(screen.getByText('Suspend Harvard University?')).toBeInTheDocument();

    // Confirm action
    await user.click(screen.getByRole('button', { name: /Yes, Suspend College/i }));

    await waitFor(() => {
      expect(mockSuspend).toHaveBeenCalledWith('col-1');
      expect(screen.getByText(/Harvard University was successfully suspended/i)).toBeInTheDocument();
    });
  });

  it('opens confirmation modal and reactivates a suspended college', async () => {
    const user = userEvent.setup();
    vi.spyOn(collegesApi, 'getColleges').mockResolvedValue(mockColleges);
    const mockReactivate = vi.spyOn(collegesApi, 'reactivateCollege').mockResolvedValue({
      ...mockColleges[1],
      status: 'ACTIVE',
    });

    renderWithProviders(<CollegeManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Oxford College')).toBeInTheDocument();
    });

    // Click Reactivate on Oxford
    await user.click(screen.getByTitle('Reactivate College'));

    // Confirmation dialog appears
    expect(screen.getByText('Reactivate Oxford College?')).toBeInTheDocument();

    // Confirm action
    await user.click(screen.getByRole('button', { name: /Yes, Reactivate College/i }));

    await waitFor(() => {
      expect(mockReactivate).toHaveBeenCalledWith('col-2');
      expect(screen.getByText(/Oxford College was successfully reactivated/i)).toBeInTheDocument();
    });
  });

  it('triggers impersonation when View as Finance is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(collegesApi, 'getColleges').mockResolvedValue(mockColleges);
    const mockImpersonate = vi.spyOn(collegesApi, 'impersonateCollege').mockResolvedValue({
      accessToken: 'test-impersonation-jwt',
      financeUser: { id: 'u-1', email: 'finance_col1@harvard.edu' },
    });

    renderWithProviders(<CollegeManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Harvard University')).toBeInTheDocument();
    });

    // Click View as Finance
    const impersonateButtons = screen.getAllByRole('button', { name: /View as Finance/i });
    await user.click(impersonateButtons[0]);

    await waitFor(() => {
      expect(mockImpersonate).toHaveBeenCalledWith('col-1');
      expect(screen.getByText(/Impersonation session started for Harvard University/i)).toBeInTheDocument();
    });
  });
});
