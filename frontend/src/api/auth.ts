import {
  API_BASE_URL,
  apiFetch,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
} from './client';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResult = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResult = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export { getStoredToken, setStoredToken, clearStoredToken };

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
    throw new Error(message ?? 'Login failed');
  }
  const result: LoginResult = await res.json();
  setStoredToken(result.accessToken);
  return result;
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<RegisterResult> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
    throw new Error(message ?? 'Registration failed');
  }
  return res.json();
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await apiFetch(`${API_BASE_URL}/auth/me`);
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return res.json();
}
