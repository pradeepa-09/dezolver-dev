import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/authApi';
import type { HealthCheckResponse } from '@/types/api';

export function useHealthCheck() {
  const query = useQuery<HealthCheckResponse, Error>({
    queryKey: ['backend-health'],
    queryFn: async () => {
      const startTime = performance.now();
      const response = await authApi.getHealth();
      const endTime = performance.now();
      return {
        ...response,
        _clientLatencyMs: Math.round(endTime - startTime),
      };
    },
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}
