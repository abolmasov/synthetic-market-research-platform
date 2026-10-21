import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage as a simple in-memory store
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('API Client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockImplementation(
      (key: string) => mockStorage[key] ?? null,
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should add Authorization header when token exists', async () => {
    mockStorage['smr_token'] = 'test-jwt-token';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
    });
    globalThis.fetch = mockFetch;

    const { apiFetch } = await import('./client');
    await apiFetch('/test');

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1].headers;
    expect(headers.get('Authorization')).toBe('Bearer test-jwt-token');
  });

  it('should not add Authorization header when no token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    globalThis.fetch = mockFetch;

    const { apiFetch } = await import('./client');
    await apiFetch('/test');

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1].headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('should parse error message from non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          statusCode: 400,
          message: 'Validation failed',
          error: 'Bad Request',
        }),
    });
    globalThis.fetch = mockFetch;

    const { parseApiError } = await import('./client');
    const response = await mockFetch('/test');
    const error = await parseApiError(response, 'Fallback');
    expect(error.message).toBe('Validation failed');
  });

  it('should join array messages from validation errors', async () => {
    const mockResponse = {
      json: () =>
        Promise.resolve({
          statusCode: 400,
          message: ['email must be valid', 'password is required'],
          error: 'Bad Request',
        }),
    } as unknown as Response;

    const { parseApiError } = await import('./client');
    const error = await parseApiError(mockResponse, 'Fallback');
    expect(error.message).toBe('email must be valid, password is required');
  });

  it('should use fallback message when body parse fails', async () => {
    const mockResponse = {
      json: () => Promise.reject(new Error('parse error')),
    } as unknown as Response;

    const { parseApiError } = await import('./client');
    const error = await parseApiError(mockResponse, 'Something went wrong');
    expect(error.message).toBe('Something went wrong');
  });

  it('should throw timeout error on AbortError', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    Object.setPrototypeOf(abortError, DOMException.prototype);

    const mockFetch = vi.fn().mockRejectedValue(abortError);
    globalThis.fetch = mockFetch;

    const { apiFetch } = await import('./client');
    await expect(apiFetch('/test')).rejects.toThrow(
      'Request timed out. Long operations (e.g. simulations) may take a few minutes. Please try again.',
    );
  });
});
