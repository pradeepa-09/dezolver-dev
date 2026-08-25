import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import * as useAuthModule from '@/features/auth/context/useAuth';
import type { User } from '@/types/auth';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/super-admin/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Screen</div>} />
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <div>Secret Super Admin Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret Super Admin Content')).not.toBeInTheDocument();
  });

  it('redirects authenticated user with unauthorized role to /403', () => {
    const studentUser: User = {
      id: 'usr-1',
      email: 'student@college.edu',
      role: 'STUDENT',
    };

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: studentUser,
      accessToken: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/super-admin/dashboard']}>
        <Routes>
          <Route path="/403" element={<div>403 Forbidden Access Page</div>} />
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <div>Secret Super Admin Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('403 Forbidden Access Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Super Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated user has SUPER_ADMIN role', () => {
    const superAdminUser: User = {
      id: 'admin-1',
      email: 'admin@dezolver.com',
      role: 'SUPER_ADMIN',
    };

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: superAdminUser,
      accessToken: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/super-admin/dashboard']}>
        <Routes>
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <div>Secret Super Admin Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Secret Super Admin Content')).toBeInTheDocument();
  });
});
