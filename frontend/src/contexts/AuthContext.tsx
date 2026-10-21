import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  fetchMe,
} from '../api/auth';
import { clearStoredToken, getStoredToken } from '../api/client';
import { AuthContext } from './auth-context';
import type { AuthUser } from '../api/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));
  const [error, setError] = useState<string | null>(null);

  // On mount, check for existing token
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        clearStoredToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const result = await apiLogin(email, password);
      setUser(result.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setError(null);
      try {
        await apiRegister(email, password, name);
        // Auto-login after registration
        const result = await apiLogin(email, password);
        setUser(result.user);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Registration failed';
        setError(msg);
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout }),
    [user, loading, error, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
