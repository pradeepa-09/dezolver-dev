import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MfaPage } from '@/features/auth/pages/MfaPage';
import { SuperAdminLayout } from '@/features/super-admin/components/SuperAdminLayout';
import { SuperAdminDashboardPage } from '@/features/super-admin/pages/SuperAdminDashboardPage';
import { CollegeManagementPage } from '@/features/super-admin/colleges/pages/CollegeManagementPage';
import { PlanConfigurationPage } from '@/features/super-admin/plans/pages/PlanConfigurationPage';
import { PlatformAnalyticsPage } from '@/features/super-admin/analytics/pages/PlatformAnalyticsPage';
import { ProfileSettingsPage } from '@/features/super-admin/profile/pages/ProfileSettingsPage';
import { ForbiddenPage } from '@/features/errors/pages/ForbiddenPage';
import { NotFoundPage } from '@/features/errors/pages/NotFoundPage';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';

export const router = createBrowserRouter([
  // Public Root Redirection -> sends to super admin dashboard (which triggers ProtectedRoute)
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />,
  },
  {
    path: ROUTES.PROFILE,
    element: <Navigate to={ROUTES.SUPER_ADMIN_PROFILE} replace />,
  },

  // Authentication Routes
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.MFA,
    element: <MfaPage />,
  },

  // Protected Super Admin Routes (Role: SUPER_ADMIN)
  {
    path: ROUTES.SUPER_ADMIN_ROOT,
    element: (
      <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <SuperAdminDashboardPage />,
      },
      {
        path: 'colleges',
        element: <CollegeManagementPage />,
      },
      {
        path: 'plans',
        element: <PlanConfigurationPage />,
      },
      {
        path: 'analytics',
        element: <PlatformAnalyticsPage />,
      },
      {
        path: 'profile',
        element: <ProfileSettingsPage />,
      },
    ],
  },

  // Standard Error State Routes
  {
    path: ROUTES.FORBIDDEN,
    element: <ForbiddenPage />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },

  // Catch-all 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
