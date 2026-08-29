import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import * as useAuthModule from '@/features/auth/context/useAuth';
import { UnauthorizedError } from '@/lib/api/errors';

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    mockLogin.mockReset();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      verifyMfa: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });
  });

  it('renders login form with email, password, remember me, forgot password, and submit button', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^PASSWORD$/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign in$/i })).toBeInTheDocument();
  });

  it('displays client-side validation errors when submitted empty', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    expect(screen.getByText('Email address is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('displays client-side validation error for invalid email format', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/EMAIL/i), 'not-an-email');
    await user.type(screen.getByLabelText(/^PASSWORD$/i, { selector: 'input' }), 'validPassword123');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with trimmed email and password on valid submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      user: { id: '1', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/EMAIL/i), ' admin@dezolver.com ');
    await user.type(screen.getByLabelText(/^PASSWORD$/i, { selector: 'input' }), 'secretPassword123');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@dezolver.com',
        password: 'secretPassword123',
      });
    });
  });

  it('navigates to /mfa with preserved state when mfaRequired is true', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      mfaRequired: true,
      mfaToken: 'temp-mfa-token-123',
      user: { id: 'user-mfa-id', email: 'admin@dezolver.com', role: 'SUPER_ADMIN' },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/EMAIL/i), 'admin@dezolver.com');
    await user.type(screen.getByLabelText(/^PASSWORD$/i, { selector: 'input' }), 'validPassword123');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@dezolver.com',
        password: 'validPassword123',
      });
    });
  });

  it('displays error banner when login rejects with UnauthorizedError', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new UnauthorizedError('Invalid email or password'));

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/EMAIL/i), 'admin@dezolver.com');
    await user.type(screen.getByLabelText(/^PASSWORD$/i, { selector: 'input' }), 'wrongPassword');
    await user.click(screen.getByRole('button', { name: /^Sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid email or password. Please check your credentials/i),
      ).toBeInTheDocument();
    });
  });

  it('shows informational feedback when clicking Forgot password', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /Forgot password\?/i }));

    expect(
      screen.getByText(/Please contact your platform administrator to reset your credentials/i),
    ).toBeInTheDocument();
  });
});
