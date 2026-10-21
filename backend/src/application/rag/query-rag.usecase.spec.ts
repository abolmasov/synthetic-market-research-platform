import { QueryRagUseCase } from './query-rag.usecase';
import type { RagSourceProvider } from '../../domain/rag/rag-source.provider';

describe('QueryRagUseCase', () => {
  let useCase: QueryRagUseCase;
  let mockProvider: jest.Mocked<RagSourceProvider>;

  beforeEach(() => {
    mockProvider = {
      query: jest.fn(),
    };
    useCase = new QueryRagUseCase(mockProvider);
  });

  it('delegates hypothesis lookup to the provider', async () => {
    const sources = [
      {
        title: 'Industry report',
        url: 'https://example.com/report',
        snippet: 'Demand is rising among young professionals.',
        relevanceScore: 0.91,
      },
    ];
    mockProvider.query.mockResolvedValue(sources);

    const result = await useCase.execute({
      hypothesis: 'Users will pay for a premium wellness bundle',
    });

    expect(mockProvider.query.mock.calls).toHaveLength(1);
    expect(mockProvider.query.mock.calls[0][0]).toBe(
      'Users will pay for a premium wellness bundle',
    );
    expect(result).toEqual(sources);
  });
});
