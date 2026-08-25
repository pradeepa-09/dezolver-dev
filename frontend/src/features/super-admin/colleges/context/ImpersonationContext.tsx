import * as React from 'react';
import { collegesApi } from '../api/collegesApi';
import { apiClient } from '@/lib/api/apiClient';
import type { College } from '@/types/colleges';

const IMPERSONATION_STORAGE_KEY = 'dezolver_impersonation_session';

export interface ImpersonationSession {
  impersonationToken: string;
  targetCollege: {
    id: string;
    name: string;
  };
  financeUser: {
    id: string;
    email: string;
  };
}

export interface ImpersonationContextValue {
  isImpersonating: boolean;
  impersonationToken: string | null;
  targetCollege: { id: string; name: string } | null;
  financeUser: { id: string; email: string } | null;
  isLoading: boolean;
  startImpersonation: (college: College) => Promise<void>;
  stopImpersonation: () => Promise<void>;
}

export const ImpersonationContext = React.createContext<
  ImpersonationContextValue | undefined
>(undefined);

export interface ImpersonationProviderProps {
  children: React.ReactNode;
}

export const ImpersonationProvider: React.FC<ImpersonationProviderProps> = ({
  children,
}) => {
  const [session, setSession] = React.useState<ImpersonationSession | null>(() => {
    try {
      const stored = sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const startImpersonation = React.useCallback(async (college: College) => {
    setIsLoading(true);
    try {
      const result = await collegesApi.impersonateCollege(college.id);
      const newSession: ImpersonationSession = {
        impersonationToken: result.accessToken,
        targetCollege: {
          id: college.id,
          name: college.name,
        },
        financeUser: result.financeUser,
      };

      setSession(newSession);
      try {
        sessionStorage.setItem(
          IMPERSONATION_STORAGE_KEY,
          JSON.stringify(newSession),
        );
      } catch {
        // Storage errors ignored
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopImpersonation = React.useCallback(async () => {
    if (!session) return;
    setIsLoading(true);

    try {
      // 1. Call the backend stop endpoint with impersonation JWT to emit audit log
      await collegesApi.impersonateStop(
        session.targetCollege.id,
        session.impersonationToken,
      );
    } finally {
      // 2. Clear impersonation state
      setSession(null);
      try {
        sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      } catch {
        // Storage errors ignored
      }

      // 3. Trigger /auth/refresh to ensure Super Admin access token is completely fresh
      try {
        await apiClient.refreshAccessToken();
      } catch {
        // Refresh fallback: continue with existing access token
      }

      setIsLoading(false);
    }
  }, [session]);

  const value = React.useMemo<ImpersonationContextValue>(() => {
    return {
      isImpersonating: !!session,
      impersonationToken: session?.impersonationToken || null,
      targetCollege: session?.targetCollege || null,
      financeUser: session?.financeUser || null,
      isLoading,
      startImpersonation,
      stopImpersonation,
    };
  }, [session, isLoading, startImpersonation, stopImpersonation]);

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};
