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

describe('variants API', () => {
  it('fetchVariants calls correct URL with hypothesisId', async () => {
    const page = { data: [{ id: 'var-1' }], total: 1, page: 1, limit: 20, totalPages: 1 };
    mockFetchResponse(page);

    const { fetchVariants } = await import('./variants');
    const result = await fetchVariants('hyp-1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/hypotheses\/hyp-1\/variants/);
    expect(result).toEqual(page);
  });

  it('fetchVariants throws on error', async () => {
    mockFetchResponse({ message: 'Not Found' }, false, 404);

    const { fetchVariants } = await import('./variants');
    await expect(fetchVariants('hyp-missing')).rejects.toThrow();
  });

  it('getVariant calls correct URL', async () => {
    const variant = { id: 'var-1', hypothesisId: 'hyp-1', name: 'Control' };
    mockFetchResponse(variant);

    const { getVariant } = await import('./variants');
    const result = await getVariant('hyp-1', 'var-1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/hypotheses\/hyp-1\/variants\/var-1/);
    expect(result).toEqual(variant);
  });

  it('getVariant throws on error', async () => {
    mockFetchResponse({ message: 'Not Found' }, false, 404);

    const { getVariant } = await import('./variants');
    await expect(getVariant('hyp-1', 'bad-id')).rejects.toThrow();
  });

  it('createVariant sends POST with JSON body', async () => {
    const variant = { id: 'var-2', name: 'Variant A', changeSummary: 'Lower price', content: 'test' };
    mockFetchResponse(variant);

    const { createVariant } = await import('./variants');
    const result = await createVariant('hyp-1', {
      name: 'Variant A',
      changeSummary: 'Lower price',
      content: 'test',
    });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/hypotheses\/hyp-1\/variants$/);
    expect(call[1].method).toBe('POST');
    const headers = call[1].headers;
    const contentType =
      headers instanceof Headers
        ? headers.get('Content-Type')
        : headers?.['Content-Type'] ?? headers?.['content-type'];
    expect(contentType).toBe('application/json');
    expect(JSON.parse(call[1].body as string)).toMatchObject({ name: 'Variant A' });
    expect(result).toEqual(variant);
  });

  it('createVariant throws on error', async () => {
    mockFetchResponse({ message: 'Bad Request' }, false, 400);

    const { createVariant } = await import('./variants');
    await expect(
      createVariant('hyp-1', { name: '', changeSummary: '', content: '' }),
    ).rejects.toThrow();
  });

  it('updateVariant sends PATCH with id in URL and JSON body', async () => {
    const updated = { id: 'var-1', name: 'Updated', status: 'tested' };
    mockFetchResponse(updated);

    const { updateVariant } = await import('./variants');
    const result = await updateVariant('hyp-1', 'var-1', { name: 'Updated' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/hypotheses\/hyp-1\/variants\/var-1/);
    expect(call[1].method).toBe('PATCH');
    const headers = call[1].headers;
    const contentType =
      headers instanceof Headers
        ? headers.get('Content-Type')
        : headers?.['Content-Type'] ?? headers?.['content-type'];
    expect(contentType).toBe('application/json');
    expect(JSON.parse(call[1].body as string)).toMatchObject({ name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('deleteVariant sends DELETE request', async () => {
    mockFetchResponse(null, true, 204);

    const { deleteVariant } = await import('./variants');
    await deleteVariant('hyp-1', 'var-1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/hypotheses\/hyp-1\/variants\/var-1/);
    expect(call[1].method).toBe('DELETE');
  });

  it('deleteVariant throws on error', async () => {
    mockFetchResponse({ message: 'Not Found' }, false, 404);

    const { deleteVariant } = await import('./variants');
    await expect(deleteVariant('hyp-1', 'bad-id')).rejects.toThrow();
  });
});
