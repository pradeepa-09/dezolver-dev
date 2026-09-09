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
  mfaRequired?: boolean;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface VerifyOtpPayload {
  userId: string;
  otpCode: string;
  mfaToken: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
}

export interface MfaEnablePayload {
  otpCode: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
