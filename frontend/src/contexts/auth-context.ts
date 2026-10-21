import { createContext } from 'react';
import type { AuthUser } from '../api/auth';

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);
