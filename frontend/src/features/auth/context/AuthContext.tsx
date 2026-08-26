import * as React from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { authApi } from '@/features/auth/api/authApi';
import type { User, LoginCredentials, AuthState } from '@/types/auth';

const SESSION_USER_KEY = 'dezolver_auth_user';

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ requiresMfa?: boolean; user: User }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = React.useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessTokenState] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const setUser = React.useCallback((newUser: User | null) => {
    setUserState(newUser);
    try {
      if (newUser) {
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem(SESSION_USER_KEY);
      }
    } catch {
      // Storage errors ignored
    }
  }, []);

  React.useEffect(() => {
    apiClient.setOnUnauthorized(() => {
      setUser(null);
      setAccessTokenState(null);
    });

    return () => {
      apiClient.setOnUnauthorized(null);
    };
  }, [setUser]);

  const login = React.useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const responseData = await authApi.login(credentials);

        if (responseData.accessToken) {
          setAccessTokenState(responseData.accessToken);
          apiClient.setAccessToken(responseData.accessToken);
        }

        if (responseData.user) {
          setUser(responseData.user);
        }

        return {
          requiresMfa: responseData.requiresMfa,
          user: responseData.user,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      // Always reset local state and access token
      apiClient.setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
      setIsLoading(false);
    }
  }, [setUser]);

  const value = React.useMemo<AuthContextValue>(() => {
    return {
      user,
      accessToken,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      setUser,
    };
  }, [user, accessToken, isLoading, login, logout, setUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
