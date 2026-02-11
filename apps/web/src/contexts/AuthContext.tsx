import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, checkAuth, setToken, clearToken, getToken } from '@/api/auth';

type AuthState = {
  username: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuth = useCallback(async () => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const user = await checkAuth();
      setUsername(user?.username ?? null);
    } catch {
      clearToken();
      setUsername(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  const login = useCallback(async (u: string, p: string) => {
    const data = await apiLogin(u, p);
    setToken(data.token);
    setUsername(data.username);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUsername(null);
  }, []);

  const value: AuthContextValue = {
    username,
    isLoading,
    isAuthenticated: !!username,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
