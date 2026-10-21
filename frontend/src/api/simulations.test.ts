import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchResponse(
  body: unknown,
  ok = true,
  status = 200,
  headers: Record<string, string> = {},
) {
  const headersMap = new Map(Object.entries(headers));
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
    blob: () => Promise.resolve(new Blob()),
    headers: {
      get: (key: string) => headersMap.get(key) ?? null,
    },
  });
}

describe('simulations API', () => {
  it('fetchSimulations calls correct URL with default pagination', async () => {
    mockFetchResponse({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

    const { fetchSimulations } = await import('./simulations');
    await fetchSimulations();

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/simulations\?/);
    expect(call[0]).toMatch(/page=1/);
    expect(call[0]).toMatch(/limit=20/);
  });

  it('fetchSimulations passes custom pagination params', async () => {
    mockFetchResponse({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 });

    const { fetchSimulations } = await import('./simulations');
    await fetchSimulations(2, 10);

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/page=2/);
    expect(call[0]).toMatch(/limit=10/);
  });

  it('fetchSimulations throws on error response', async () => {
    mockFetchResponse({ message: 'Unauthorized' }, false, 401);

    const { fetchSimulations } = await import('./simulations');
    await expect(fetchSimulations()).rejects.toThrow();
  });

  it('fetchSimulationById calls correct URL', async () => {
    const sim = { id: 'sim-1', hypothesis: 'Test', status: 'completed' };
    mockFetchResponse(sim);

    const { fetchSimulationById } = await import('./simulations');
    const result = await fetchSimulationById('sim-1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/simulations\/sim-1/);
    expect(result).toEqual(sim);
  });

  it('fetchSimulationById throws on 404', async () => {
    mockFetchResponse({ message: 'Not Found' }, false, 404);

    const { fetchSimulationById } = await import('./simulations');
    await expect(fetchSimulationById('missing')).rejects.toThrow();
  });

  it('runSimulation sends POST with JSON body', async () => {
    const sim = { id: 'sim-1', hypothesis: 'Test at $49/month', status: 'completed' };
    mockFetchResponse(sim);

    const { runSimulation } = await import('./simulations');
    const result = await runSimulation({
      hypothesis: 'Test at $49/month',
      personaIds: ['p1', 'p2'],
    });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/simulations$/);
    expect(call[1].method).toBe('POST');
    expect((call[1].headers as Headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(call[1].body as string)).toMatchObject({
      hypothesis: 'Test at $49/month',
      personaIds: ['p1', 'p2'],
    });
    expect(result).toEqual(sim);
  });

  it('fetchSimulationReportMetadata calls correct URL', async () => {
    const metadata = {
      reportId: 'r1',
      schemaVersion: '1',
      templateVersion: '1',
      generatedAt: '2026-01-01',
      generator: 'smr-api',
      simulationId: 'sim-1',
      simulationSnapshotHash: 'abc123',
      decisionCount: 10,
    };
    mockFetchResponse(metadata);

    const { fetchSimulationReportMetadata } = await import('./simulations');
    const result = await fetchSimulationReportMetadata('sim-1');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/simulations\/sim-1\/report\/metadata/);
    expect(result).toEqual(metadata);
  });
});
