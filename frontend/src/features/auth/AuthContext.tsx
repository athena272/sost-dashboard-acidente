import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  canWriteAccidents as roleCanWrite,
  isAdmin as roleIsAdmin,
  UserRole,
} from '@sost/shared';
import { api, setToken } from '../../lib/api';

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
  name?: string;
  createdAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  canWriteAccidents: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (input: {
    username: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const me = await api<AuthUser>('/auth/me');
    setUser(me);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sost_token');
    if (!token) {
      setLoading(false);
      return;
    }
    refreshMe()
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await api<{ accessToken: string; user: AuthUser }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
    );
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (input: { username: string; password: string; name?: string }) => {
      const result = await api<{ accessToken: string; user: AuthUser }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
      setToken(result.accessToken);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      canWriteAccidents: user ? roleCanWrite(user.role) : false,
      isAdmin: user ? roleIsAdmin(user.role) : false,
      login,
      register,
      refreshMe,
      logout,
    }),
    [user, loading, login, register, refreshMe, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
