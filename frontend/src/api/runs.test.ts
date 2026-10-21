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

describe('runs API', () => {
  it('createRun sends POST with JSON body', async () => {
    const run = { id: 'run-1', hypothesisId: 'hyp-1', stage: 'H1', status: 'queued' };
    mockFetchResponse(run);

    const { createRun } = await import('./runs');
    const result = await createRun({
      hypothesisId: 'hyp-1',
      variantIds: ['var-1'],
      stage: 'H1',
      status: 'queued',
      config: {},
    });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/runs$/);
    expect(call[1].method).toBe('POST');
    const postHeaders = call[1].headers;
    const postContentType =
      postHeaders instanceof Headers
        ? postHeaders.get('Content-Type')
        : postHeaders?.['Content-Type'] ?? postHeaders?.['content-type'];
    expect(postContentType).toBe('application/json');
    expect(JSON.parse(call[1].body as string)).toMatchObject({
      hypothesisId: 'hyp-1',
      stage: 'H1',
    });
    expect(result).toEqual(run);
  });

  it('createRun throws on error', async () => {
    mockFetchResponse({ message: 'Bad Request' }, false, 400);

    const { createRun } = await import('./runs');
    await expect(
      createRun({ hypothesisId: 'h1', variantIds: [], stage: 'H1', status: 'queued', config: {} }),
    ).rejects.toThrow();
  });

  it('fetchRunsByHypothesis calls correct URL with hypothesisId param', async () => {
    const runs = [{ id: 'run-1', hypothesisId: 'hyp-1' }];
    mockFetchResponse(runs);

    const { fetchRunsByHypothesis } = await import('./runs');
    const result = await fetchRunsByHypothesis('hyp-1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/runs\?/);
    expect(call[0]).toMatch(/hypothesisId=hyp-1/);
    expect(result).toEqual(runs);
  });

  it('fetchRunsByHypothesis throws on error', async () => {
    mockFetchResponse({ message: 'Unauthorized' }, false, 401);

    const { fetchRunsByHypothesis } = await import('./runs');
    await expect(fetchRunsByHypothesis('hyp-1')).rejects.toThrow();
  });

  it('getRun calls correct URL', async () => {
    const run = { id: 'run-abc', hypothesisId: 'hyp-1' };
    mockFetchResponse(run);

    const { getRun } = await import('./runs');
    const result = await getRun('run-abc');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/runs\/run-abc/);
    expect(result).toEqual(run);
  });

  it('updateRun sends PATCH with id in URL and JSON body', async () => {
    const updated = { id: 'run-1', status: 'running' };
    mockFetchResponse(updated);

    const { updateRun } = await import('./runs');
    const result = await updateRun('run-1', { status: 'running' });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/runs\/run-1/);
    expect(call[1].method).toBe('PATCH');
    const patchHeaders = call[1].headers;
    const patchContentType =
      patchHeaders instanceof Headers
        ? patchHeaders.get('Content-Type')
        : patchHeaders?.['Content-Type'] ?? patchHeaders?.['content-type'];
    expect(patchContentType).toBe('application/json');
    expect(JSON.parse(call[1].body as string)).toMatchObject({ status: 'running' });
    expect(result).toEqual(updated);
  });
});
