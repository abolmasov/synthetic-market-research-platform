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

describe('hypotheses API', () => {
  it('fetchHypotheses calls correct URL with pagination params', async () => {
    mockFetchResponse({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

    const { fetchHypotheses } = await import('./hypotheses');
    await fetchHypotheses(undefined, 1, 10);

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/hypotheses\?/);
    expect(call[0]).toMatch(/page=1/);
    expect(call[0]).toMatch(/limit=10/);
  });

  it('fetchHypotheses appends studyId when provided', async () => {
    mockFetchResponse({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

    const { fetchHypotheses } = await import('./hypotheses');
    await fetchHypotheses('study-abc');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/studyId=study-abc/);
  });

  it('fetchHypotheses throws on non-ok response', async () => {
    mockFetchResponse({ message: 'Forbidden' }, false, 403);

    const { fetchHypotheses } = await import('./hypotheses');
    await expect(fetchHypotheses()).rejects.toThrow();
  });

  it('createHypothesis sends POST request with JSON body', async () => {
    const hypothesis = { id: 'h1', title: 'Test hypothesis', stage: 'H1' };
    mockFetchResponse(hypothesis);

    const { createHypothesis } = await import('./hypotheses');
    const result = await createHypothesis({
      title: 'Test hypothesis',
      statement: 'Users will pay $49/month',
      stage: 'H1',
      status: 'draft',
    });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe('POST');
    expect(JSON.parse(call[1].body)).toMatchObject({ title: 'Test hypothesis' });
    expect(result).toEqual(hypothesis);
  });

  it('updateHypothesis sends PATCH with id in URL', async () => {
    mockFetchResponse({ id: 'h1', title: 'Updated' });

    const { updateHypothesis } = await import('./hypotheses');
    await updateHypothesis('h1', { title: 'Updated' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/hypotheses\/h1/);
    expect(call[1].method).toBe('PATCH');
  });

  it('deleteHypothesis sends DELETE with id in URL', async () => {
    mockFetchResponse(null, true, 204);

    const { deleteHypothesis } = await import('./hypotheses');
    await deleteHypothesis('h1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/hypotheses\/h1/);
    expect(call[1].method).toBe('DELETE');
  });
});
