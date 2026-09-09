/**
 * Centralized Application Route Definitions
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  MFA: '/mfa',
  SUPER_ADMIN_ROOT: '/super-admin',
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  SUPER_ADMIN_COLLEGES: '/super-admin/colleges',
  SUPER_ADMIN_PLANS: '/super-admin/plans',
  SUPER_ADMIN_ANALYTICS: '/super-admin/analytics',
  SUPER_ADMIN_PROFILE: '/super-admin/profile',
  PROFILE: '/profile',
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
} as const;
