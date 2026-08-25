import * as React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ImpersonationProvider } from '@/features/super-admin/colleges/context/ImpersonationContext';
import { router } from './routes';

// Instantiate TanStack Query Client with sensible production defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry 401, 403, or 404 client errors
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode && [401, 403, 404].includes(statusCode)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ImpersonationProvider>
          <RouterProvider router={router} />
        </ImpersonationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
