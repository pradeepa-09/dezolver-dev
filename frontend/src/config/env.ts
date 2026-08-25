/**
 * Application environment configuration
 * Exclusively reads from Vite environment variables.
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export function getApiBaseUrl(): string {
  // Strip trailing slashes to ensure consistent path joining
  return ENV.API_BASE_URL.replace(/\/+$/, '');
}
