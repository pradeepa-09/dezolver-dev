import { getApiBaseUrl } from '@/config/env';
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NetworkError,
} from './errors';
import type { ApiErrorResponse, ApiErrorDetail } from '@/types/api';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  tokenOverride?: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];
  private onUnauthorizedCallback: (() => void) | null = null;
  private onForbiddenCallback: (() => void) | null = null;

  /**
   * Register a listener when authentication is revoked/unauthorized (e.g. 401 and refresh fails)
   */
  public setOnUnauthorized(callback: (() => void) | null): void {
    this.onUnauthorizedCallback = callback;
  }

  /**
   * Register a listener when access is forbidden (403)
   */
  public setOnForbidden(callback: (() => void) | null): void {
    this.onForbiddenCallback = callback;
  }

  /**
   * Set or clear the in-memory access token
   */
  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Get the current in-memory access token
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Main typed request method
   */
  public async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Construct URL with query parameters
    let url = `${baseUrl}${cleanEndpoint}`;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Extract custom options from RequestInit options
    const {
      body,
      params: _params,
      skipAuth,
      skipErrorHandling: _skipErrorHandling,
      tokenOverride,
      headers: customHeaders,
      ...nativeFetchOptions
    } = options;

    // Prepare headers
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    if (body !== undefined && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const effectiveToken = tokenOverride || (!skipAuth ? this.accessToken : null);

    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
    }

    let serializedBody: BodyInit | undefined;
    if (body !== undefined) {
      serializedBody =
        body instanceof FormData ? body : JSON.stringify(body);
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      ...nativeFetchOptions,
      headers,
      body: serializedBody,
      // Ensure cookies are included for HttpOnly refresh-token flows
      credentials: options.credentials || 'include',
    };

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (networkErr) {
      throw new NetworkError(
        networkErr instanceof Error ? networkErr.message : 'Network error occurred',
      );
    }

    // Handle 401 Unauthorized with Refresh Hook (only when using default Super Admin token)
    if (
      response.status === 401 &&
      !skipAuth &&
      !tokenOverride &&
      !endpoint.includes('/auth/refresh')
    ) {
      const refreshed = await this.handleTokenRefresh();
      if (refreshed && this.accessToken) {
        // Retry the original request with the new access token
        return this.request<T>(endpoint, options);
      }
      if (this.onUnauthorizedCallback) {
        this.onUnauthorizedCallback();
      }
      throw new UnauthorizedError();
    }

    // Handle other HTTP errors
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    try {
      const data = await response.json();
      return data as T;
    } catch {
      return {} as T;
    }
  }

  public get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Explicitly trigger /auth/refresh using HttpOnly cookie to acquire fresh access token
   */
  public async refreshAccessToken(): Promise<string | null> {
    const success = await this.handleTokenRefresh();
    return success ? this.accessToken : null;
  }

  /**
   * Refresh-token retry handler hook
   * Sends POST to /auth/refresh with HttpOnly cookie automatically attached
   */
  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise<boolean>((resolve) => {
        this.refreshSubscribers.push((newToken) => {
          resolve(!!newToken);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        this.setAccessToken(null);
        this.notifyRefreshSubscribers(null);
        return false;
      }

      const result = await response.json();
      const newAccessToken =
        result?.data?.accessToken || result?.accessToken || null;

      if (newAccessToken) {
        this.setAccessToken(newAccessToken);
        this.notifyRefreshSubscribers(newAccessToken);
        return true;
      }

      this.setAccessToken(null);
      this.notifyRefreshSubscribers(null);
      return false;
    } catch {
      this.setAccessToken(null);
      this.notifyRefreshSubscribers(null);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  private notifyRefreshSubscribers(newToken: string | null): void {
    this.refreshSubscribers.forEach((callback) => callback(newToken));
    this.refreshSubscribers = [];
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ApiErrorResponse | null = null;
    let fallbackMessage = `Request failed with status ${response.status} (${response.statusText})`;

    try {
      errorData = (await response.json()) as ApiErrorResponse;
      if (errorData) {
        if (typeof errorData.message === 'string') {
          fallbackMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          fallbackMessage = errorData.message.join(', ');
        } else if (errorData.error) {
          fallbackMessage = errorData.error;
        }
      }
    } catch {
      // Body is not JSON
    }

    const fieldErrors: ApiErrorDetail[] = errorData?.errors || [];

    // Extract NestJS validation pipe style array messages into structured field errors if applicable
    if (Array.isArray(errorData?.message)) {
      errorData.message.forEach((msg) => {
        if (typeof msg === 'string') {
          fieldErrors.push({ message: msg });
        }
      });
    }

    if (response.status === 401) {
      throw new UnauthorizedError(fallbackMessage);
    }

    if (response.status === 403) {
      if (this.onForbiddenCallback) {
        this.onForbiddenCallback();
      }
      throw new ForbiddenError(fallbackMessage);
    }

    if (response.status === 400 || response.status === 422) {
      throw new ValidationError(fallbackMessage, fieldErrors, errorData || undefined);
    }

    throw new ApiError(
      fallbackMessage,
      response.status,
      fieldErrors,
      errorData || undefined,
    );
  }
}

export const apiClient = new ApiClient();
