import * as React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/useAuth';
import { ROUTES } from '@/config/routes';
import { LoadingState } from '@/components/shared/LoadingState';
import type { Role } from '@/types/auth';

export interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = ['SUPER_ADMIN'],
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while determining auth state
  if (isLoading) {
    return <LoadingState fullScreen title="Verifying authorization..." />;
  }

  // 1. Unauthenticated -> Redirect to /login with state preservation
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Authenticated but unauthorized role -> Redirect to /403
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  // 3. Authorized -> Render children or nested Outlet
  return children ? <>{children}</> : <Outlet />;
};
