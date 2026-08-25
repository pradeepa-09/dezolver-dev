/**
 * Future-safe Dezolver system roles
 */
export type Role =
  | 'SUPER_ADMIN'
  | 'FINANCE_TEAM'
  | 'HOD'
  | 'MANAGER'
  | 'STUDENT';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  collegeId?: string | null;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken?: string;
  user: User;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
