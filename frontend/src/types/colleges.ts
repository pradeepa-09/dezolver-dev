/**
 * Backend raw role values as defined in Prisma schema
 */
export type BackendRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

/**
 * College status values supported by the backend
 */
export type CollegeStatus = 'ACTIVE' | 'SUSPENDED';

/**
 * Base College entity returned by backend
 */
export interface College {
  id: string;
  name: string;
  domain: string | null;
  status: CollegeStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * User representation inside College Details
 */
export interface CollegeUser {
  id: string;
  email: string;
  role: BackendRole;
  isActive: boolean;
}

/**
 * Full College Details returned by GET /api/colleges/:id
 */
export interface CollegeDetail extends College {
  users: CollegeUser[];
}

/**
 * DTO for POST /api/colleges
 */
export interface CreateCollegeDto {
  name: string;
  domain?: string;
}

/**
 * DTO for PATCH /api/colleges/:id
 */
export interface UpdateCollegeDto {
  name?: string;
  domain?: string;
}

/**
 * Response shape for POST /api/colleges
 */
export interface CreateCollegeResponse {
  college: College;
  financeUser: {
    id: string;
    email: string;
    role: BackendRole;
    collegeId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Response shape for POST /api/colleges/:id/impersonate
 */
export interface ImpersonateResponse {
  accessToken: string;
  financeUser: {
    id: string;
    email: string;
  };
}

/**
 * Response shape for POST /api/colleges/:id/impersonate-stop
 */
export interface ImpersonateStopResponse {
  success: boolean;
}
