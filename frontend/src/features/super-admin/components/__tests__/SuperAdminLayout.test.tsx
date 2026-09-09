import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SuperAdminLayout } from '../SuperAdminLayout';
import { ImpersonationProvider } from '@/features/super-admin/colleges/context/ImpersonationContext';
import * as useAuthModule from '@/features/auth/context/useAuth';
import type { User } from '@/types/auth';

describe('SuperAdminLayout', () => {
  it('renders branding, user badge, navigation, and triggers logout modal', async () => {
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

    const user = userEvent.setup();

    render(
      <ImpersonationProvider>
        <MemoryRouter>
          <SuperAdminLayout />
        </MemoryRouter>
      </ImpersonationProvider>,
    );

    // Sidebar Branding & Section Headers
    expect(screen.getByText('Dezolver')).toBeInTheDocument();
    expect(screen.getByText('EDTECH PLATFORM')).toBeInTheDocument();
    expect(screen.getByText('OVERVIEW')).toBeInTheDocument();
    expect(screen.getByText('MANAGEMENT')).toBeInTheDocument();

    // Top Header
    expect(screen.getByPlaceholderText('Search anything...')).toBeInTheDocument();

    // Click logout button in sidebar
    await user.click(screen.getByRole('button', { name: /Logout/i }));

    // Confirmation dialog should appear
    expect(screen.getByText('Sign Out of Super Admin?')).toBeInTheDocument();

    // Confirm logout
    await user.click(screen.getByRole('button', { name: /Yes, Sign Out/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
