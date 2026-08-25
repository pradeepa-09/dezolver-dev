/**
 * Standard generic API response envelope types
 * Isolated to accommodate backend contract adjustments seamlessly.
 */

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  errors?: ApiErrorDetail[];
  success?: boolean;
}

export interface HealthCheckResponse {
  status?: string;
  timestamp?: string;
  service?: string;
  uptime?: number;
  [key: string]: unknown;
}
