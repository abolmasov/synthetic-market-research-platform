import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('personas API', () => {
  it('fetchPersonas calls correct URL with pagination params', async () => {
    mockFetchResponse({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

    const { fetchPersonas } = await import('./personas');
    await fetchPersonas(2, 10);

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/personas\?/);
    expect(call[0]).toMatch(/page=2/);
    expect(call[0]).toMatch(/limit=10/);
  });

  it('fetchPersonas throws on non-ok response', async () => {
    mockFetchResponse({ message: 'Unauthorized' }, false, 401);

    const { fetchPersonas } = await import('./personas');
    await expect(fetchPersonas()).rejects.toThrow();
  });

  it('createPersona sends POST with JSON body', async () => {
    const newPersona = { id: 'p1', name: 'Alice', segment: 'Tech' };
    mockFetchResponse(newPersona);

    const { createPersona } = await import('./personas');
    const result = await createPersona({
      name: 'Alice',
      segment: 'Tech',
      motivations: [],
      barriers: [],
      trustChannel: 'email',
      purchaseTriggers: [],
      budgetRange: '$50-100',
    });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe('POST');
    expect((call[1].headers as Headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(call[1].body)).toMatchObject({ name: 'Alice' });
    expect(result).toEqual(newPersona);
  });

  it('updatePersona sends PATCH with id in URL', async () => {
    const updated = { id: 'p1', name: 'Alice Updated', segment: 'Tech' };
    mockFetchResponse(updated);

    const { updatePersona } = await import('./personas');
    await updatePersona('p1', { name: 'Alice Updated' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/personas\/p1/);
    expect(call[1].method).toBe('PATCH');
  });

  it('deletePersona sends DELETE with id in URL', async () => {
    mockFetchResponse(null, true, 204);

    const { deletePersona } = await import('./personas');
    await deletePersona('p1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/personas\/p1/);
    expect(call[1].method).toBe('DELETE');
  });

  it('deletePersona throws on error response', async () => {
    mockFetchResponse({ message: 'Not Found' }, false, 404);

    const { deletePersona } = await import('./personas');
    await expect(deletePersona('nonexistent')).rejects.toThrow();
  });
});
