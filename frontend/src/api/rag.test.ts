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

describe('rag API', () => {
  it('queryRag sends POST to /rag/query with hypothesis', async () => {
    const result = { hypothesis: 'sleep supplement pricing', sources: [] };
    mockFetchResponse(result);

    const { queryRag } = await import('./rag');
    const res = await queryRag('sleep supplement pricing');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/rag\/query$/);
    expect(call[1].method).toBe('POST');
    expect((call[1].headers as Headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(call[1].body as string)).toEqual({ hypothesis: 'sleep supplement pricing' });
    expect(res).toEqual(result);
  });

  it('queryRag throws on error', async () => {
    mockFetchResponse({ message: 'Server Error' }, false, 500);

    const { queryRag } = await import('./rag');
    await expect(queryRag('test')).rejects.toThrow();
  });

  it('ingestText sends POST to /rag/ingest/text with JSON body', async () => {
    mockFetchResponse({ chunksCreated: 5 });

    const { ingestText } = await import('./rag');
    const result = await ingestText({
      text: 'Market report content...',
      title: 'Q1 Market Report',
      sourceType: 'report',
      industry: 'wellness',
    });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/rag\/ingest\/text$/);
    expect(call[1].method).toBe('POST');
    expect((call[1].headers as Headers).get('Content-Type')).toBe('application/json');
    const body = JSON.parse(call[1].body as string);
    expect(body).toMatchObject({ title: 'Q1 Market Report', sourceType: 'report', industry: 'wellness' });
    expect(result).toEqual({ chunksCreated: 5 });
  });

  it('ingestText throws on error', async () => {
    mockFetchResponse({ message: 'Forbidden' }, false, 403);

    const { ingestText } = await import('./rag');
    await expect(ingestText({ text: 'x', title: 't', sourceType: 'report' })).rejects.toThrow();
  });

  it('fetchRagStats calls GET /rag/stats', async () => {
    const stats = { totalChunks: 100, bySourceType: {}, byIndustry: {} };
    mockFetchResponse(stats);

    const { fetchRagStats } = await import('./rag');
    const result = await fetchRagStats();

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/rag\/stats$/);
    expect(result).toEqual(stats);
  });

  it('fetchRagDocuments calls GET /rag/documents', async () => {
    const docs = [{ id: 'doc-1', title: 'Report', sourceType: 'report' }];
    mockFetchResponse(docs);

    const { fetchRagDocuments } = await import('./rag');
    const result = await fetchRagDocuments();

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/rag\/documents$/);
    expect(result).toEqual(docs);
  });

  it('clearAllDocuments sends DELETE to /rag/documents', async () => {
    mockFetchResponse({ deletedChunks: 42 });

    const { clearAllDocuments } = await import('./rag');
    const result = await clearAllDocuments();

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/rag\/documents$/);
    expect(call[1].method).toBe('DELETE');
    expect(result).toEqual({ deletedChunks: 42 });
  });

  it('deleteRagDocument sends DELETE with encoded document id', async () => {
    mockFetchResponse({ deletedChunks: 3 });

    const { deleteRagDocument } = await import('./rag');
    const result = await deleteRagDocument('doc-abc');

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/\/rag\/documents\/doc-abc$/);
    expect(call[1].method).toBe('DELETE');
    expect(result).toEqual({ deletedChunks: 3 });
  });

  it('deleteRagDocument throws on error', async () => {
    mockFetchResponse({ message: 'Not Found' }, false, 404);

    const { deleteRagDocument } = await import('./rag');
    await expect(deleteRagDocument('missing')).rejects.toThrow();
  });
});
