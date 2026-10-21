const API_VERSION = 'v1';
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000') + '/' + API_VERSION;

const TOKEN_KEY = 'smr_token';
const DEFAULT_TIMEOUT_MS = 45000;
let cachedToken: string | null | undefined;

type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

export function getStoredToken(): string | null {
  if (cachedToken !== undefined) {
    return cachedToken;
  }

  cachedToken = localStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

export function setStoredToken(token: string): void {
  cachedToken = token;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  cachedToken = null;
  localStorage.removeItem(TOKEN_KEY);
}

function statusToMessage(status: number): string {
  if (status >= 500) return 'The server is temporarily unavailable. Please try again in a few minutes.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 400) return 'Invalid request. Please check your input and try again.';
  return 'Something went wrong. Please try again.';
}

export async function parseApiError(
  response: Response,
  fallbackMessage: string,
): Promise<Error> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(body.message) && body.message.length > 0) {
      return new Error(body.message.join(', '));
    }
    if (typeof body.message === 'string' && body.message.trim().length > 0) {
      return new Error(body.message);
    }
    if (typeof body.error === 'string' && body.error.trim().length > 0) {
      return new Error(body.error);
    }
  } catch {
    // Ignore parse failures and return fallback below.
  }

  const statusMessage = statusToMessage(response.status);
  if (response.status >= 500 || response.status === 429) {
    return new Error(statusMessage);
  }
  return new Error(fallbackMessage);
}

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the JWT Bearer token and handles 401 by clearing the
 * stored token and redirecting to the login page.
 */
export async function apiFetch(
  input: string | URL | Request,
  init?: ApiFetchOptions,
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestInit } = init ?? {};
  const token = getStoredToken();
  const headers = new Headers(requestInit.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(input, {
      ...requestInit,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        'Request timed out. Long operations (e.g. simulations) may take a few minutes. Please try again.',
      );
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to the server. Check your internet connection and try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (response.status === 401) {
    clearStoredToken();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
}
