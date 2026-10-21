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

describe('segments API', () => {
  it('fetchSegments calls correct URL with pagination params', async () => {
    mockFetchResponse({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

    const { fetchSegments } = await import('./segments');
    await fetchSegments(3, 5);

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/segments\?/);
    expect(call[0]).toMatch(/page=3/);
    expect(call[0]).toMatch(/limit=5/);
  });

  it('getSegment calls correct URL with segment id', async () => {
    const segment = { id: 's1', name: 'Tech Workers' };
    mockFetchResponse(segment);

    const { getSegment } = await import('./segments');
    const result = await getSegment('s1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/segments\/s1$/);
    expect(result).toEqual(segment);
  });

  it('getSegment throws on non-ok response', async () => {
    mockFetchResponse({ message: 'Not Found' }, false, 404);

    const { getSegment } = await import('./segments');
    await expect(getSegment('nonexistent')).rejects.toThrow();
  });

  it('createSegment sends POST with JSON body', async () => {
    const segment = { id: 's1', name: 'Tech Workers' };
    mockFetchResponse(segment);

    const { createSegment } = await import('./segments');
    const result = await createSegment({
      name: 'Tech Workers',
      description: 'Software engineers',
      demographicCriteria: {},
      psychographicTraits: {},
      behavioralPatterns: {},
    });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe('POST');
    expect((call[1].headers as Headers).get('Content-Type')).toBe('application/json');
    expect(result).toEqual(segment);
  });

  it('updateSegment sends PATCH with id in URL', async () => {
    mockFetchResponse({ id: 's1', name: 'Updated Segment' });

    const { updateSegment } = await import('./segments');
    await updateSegment('s1', { name: 'Updated Segment' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/segments\/s1/);
    expect(call[1].method).toBe('PATCH');
  });

  it('deleteSegment sends DELETE with id in URL', async () => {
    mockFetchResponse(null, true, 204);

    const { deleteSegment } = await import('./segments');
    await deleteSegment('s1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/segments\/s1/);
    expect(call[1].method).toBe('DELETE');
  });

  it('generatePersonasFromSegment sends POST to generate-personas endpoint', async () => {
    const genResult = { generated: 5, personas: [] };
    mockFetchResponse(genResult);

    const { generatePersonasFromSegment } = await import('./segments');
    const result = await generatePersonasFromSegment('s1', { count: 5 });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/segments\/s1\/generate-personas/);
    expect(call[1].method).toBe('POST');
    expect(result).toEqual(genResult);
  });
});
