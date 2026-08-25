import type { ApiErrorResponse, ApiErrorDetail } from '@/types/api';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: ApiErrorDetail[];
  readonly rawResponse?: ApiErrorResponse;

  constructor(
    message: string,
    statusCode: number = 500,
    errors: ApiErrorDetail[] = [],
    rawResponse?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.rawResponse = rawResponse;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access. Please log in again.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden. You do not have permission to view this resource.') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed.', errors: ApiErrorDetail[] = [], rawResponse?: ApiErrorResponse) {
    super(message, 400, errors, rawResponse);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error. Unable to communicate with the server.') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}
