import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MfaPage } from '../MfaPage';
import * as useAuthModule from '@/features/auth/context/useAuth';
import { UnauthorizedError, ForbiddenError, NetworkError } from '@/lib/api/errors';

describe('MfaPage', () => {
  const mockVerifyMfa = vi.fn();

  beforeEach(() => {
    mockVerifyMfa.mockReset();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      verifyMfa: mockVerifyMfa,
      logout: vi.fn(),
      setUser: vi.fn(),
    });
  });

  it('renders missing session alert and return button when navigated to without state', () => {
    render(
      <MemoryRouter initialEntries={['/mfa']}>
        <Routes>
          <Route path="/mfa" element={<MfaPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/No active MFA session found. Please sign in with your username and password first./i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Login/i })).toBeInTheDocument();
  });

  it('renders OTP input and user email when location state is present', () => {
    const state = {
      mfaToken: 'temp-token-jwt',
      user: { id: 'u1', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' as const },
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/mfa', state }]}>
        <Routes>
          <Route path="/mfa" element={<MfaPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('admin@dezolver.com')).toBeInTheDocument();
    expect(screen.getByLabelText(/6-Digit Verification Code/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /Verify & Continue/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button only when 6 digits are typed and submits successfully', async () => {
    const user = userEvent.setup();
    const state = {
      mfaToken: 'temp-token-jwt',
      user: { id: 'u1', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' as const },
      from: '/super-admin/dashboard',
    };

    mockVerifyMfa.mockResolvedValue({
      accessToken: 'final-token-xyz',
      user: { id: 'u1', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' as const },
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/mfa', state }]}>
        <Routes>
          <Route path="/mfa" element={<MfaPage />} />
          <Route path="/super-admin/dashboard" element={<div>Dashboard Landed</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/6-Digit Verification Code/i);
    const submitBtn = screen.getByRole('button', { name: /Verify & Continue/i });

    await user.type(input, '12345');
    expect(submitBtn).toBeDisabled();

    await user.type(input, '6');
    expect(submitBtn).not.toBeDisabled();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyMfa).toHaveBeenCalledWith({
        userId: 'u1',
        otpCode: '123456',
        mfaToken: 'temp-token-jwt',
      });
    });

    expect(
      screen.getByText(/Verification successful. Redirecting to your dashboard.../i),
    ).toBeInTheDocument();
  });

  it('displays invalid code error message when verifyMfa throws UnauthorizedError', async () => {
    const user = userEvent.setup();
    const state = {
      mfaToken: 'temp-token-jwt',
      user: { id: 'u1', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' as const },
    };

    mockVerifyMfa.mockRejectedValue(new UnauthorizedError('Invalid OTP code'));

    render(
      <MemoryRouter initialEntries={[{ pathname: '/mfa', state }]}>
        <Routes>
          <Route path="/mfa" element={<MfaPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/6-Digit Verification Code/i);
    await user.type(input, '000000');
    await user.click(screen.getByRole('button', { name: /Verify & Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid verification code. Please check your authenticator app/i),
      ).toBeInTheDocument();
    });
  });

  it('displays expired session error message when error message contains expired', async () => {
    const user = userEvent.setup();
    const state = {
      mfaToken: 'expired-token-jwt',
      user: { id: 'u1', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' as const },
    };

    mockVerifyMfa.mockRejectedValue(new UnauthorizedError('Invalid or expired MFA token'));

    render(
      <MemoryRouter initialEntries={[{ pathname: '/mfa', state }]}>
        <Routes>
          <Route path="/mfa" element={<MfaPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/6-Digit Verification Code/i);
    await user.type(input, '123456');
    await user.click(screen.getByRole('button', { name: /Verify & Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Your MFA session has expired. Please sign in again./i),
      ).toBeInTheDocument();
    });
  });

  it('handles ForbiddenError and NetworkError gracefully', async () => {
    const user = userEvent.setup();
    const state = {
      mfaToken: 'temp-token-jwt',
      user: { id: 'u1', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' as const },
    };

    // 1. ForbiddenError
    mockVerifyMfa.mockRejectedValueOnce(new ForbiddenError('Forbidden'));

    render(
      <MemoryRouter initialEntries={[{ pathname: '/mfa', state }]}>
        <Routes>
          <Route path="/mfa" element={<MfaPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/6-Digit Verification Code/i);
    await user.type(input, '123456');
    await user.click(screen.getByRole('button', { name: /Verify & Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Access denied. You do not have permission/i)).toBeInTheDocument();
    });

    // 2. NetworkError
    mockVerifyMfa.mockRejectedValueOnce(new NetworkError('Network failed'));
    await user.click(screen.getByRole('button', { name: /Verify & Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Unable to reach authentication server./i)).toBeInTheDocument();
    });
  });
});
