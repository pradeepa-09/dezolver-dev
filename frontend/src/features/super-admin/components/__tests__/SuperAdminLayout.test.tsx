import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SuperAdminLayout } from '../SuperAdminLayout';
import { ImpersonationProvider } from '@/features/super-admin/colleges/context/ImpersonationContext';
import * as useAuthModule from '@/features/auth/context/useAuth';
import * as useHealthCheckModule from '@/hooks/useHealthCheck';
import type { User } from '@/types/auth';

describe('SuperAdminLayout', () => {
  it('renders branding, user badge, and triggers logout modal', async () => {
    const mockLogout = vi.fn();
    const superAdmin: User = {
      id: 'usr-admin',
      email: 'superadmin@dezolver.com',
      role: 'SUPER_ADMIN',
    };

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: superAdmin,
      accessToken: 'token-xyz',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      verifyMfa: vi.fn(),
      logout: mockLogout,
      setUser: vi.fn(),
    });

    vi.spyOn(useHealthCheckModule, 'useHealthCheck').mockReturnValue({
      data: { status: 'ok' },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: vi.fn() as any,
    });

    const user = userEvent.setup();

    render(
      <ImpersonationProvider>
        <MemoryRouter>
          <SuperAdminLayout />
        </MemoryRouter>
      </ImpersonationProvider>,
    );

    expect(screen.getByText('Dezolver')).toBeInTheDocument();
    expect(screen.getByText('superadmin@dezolver.com')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();

    // Click logout button
    await user.click(screen.getByRole('button', { name: /Logout/i }));

    // Confirmation dialog should appear
    expect(screen.getByText('Sign Out of Super Admin?')).toBeInTheDocument();

    // Confirm logout
    await user.click(screen.getByRole('button', { name: /Yes, Sign Out/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
