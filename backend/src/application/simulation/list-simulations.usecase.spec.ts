import { ListSimulationsUseCase } from './list-simulations.usecase';
import { Simulation } from '../../domain/simulation/simulation';
import type { SimulationRepository } from '../../domain/simulation/simulation.repository';

const makeSimulation = (id: string): Simulation =>
  Simulation.rehydrate({
    id,
    createdAt: new Date('2026-01-01'),
    hypothesis: 'Product X at $49/month',
    hypothesisId: 'hyp-1',
    workspaceId: null,
    status: 'completed',
    summary: {
      acceptanceRate: 0.6,
      rejectionRate: 0.3,
      maybeRate: 0.1,
      averageConfidence: 0.7,
      avgLoopDepth: 1.2,
      totalPersonas: 10,
      segmentBreakdown: [],
      confidenceDistribution: [],
      topAcceptReasons: [],
      topRejectReasons: [],
      objectionFrequency: [],
      avgSentimentScore: 0.4,
      priceAnchorHitRate: 0.5,
    },
    decisions: [],
    ragSources: [],
    topSignals: ['price sensitivity'],
    objections: ['too expensive'],
    completedAt: new Date('2026-01-01'),
  });

describe('ListSimulationsUseCase', () => {
  let useCase: ListSimulationsUseCase;
  let mockRepo: jest.Mocked<SimulationRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListSimulationsUseCase(mockRepo);
  });

  it('should return all simulations when called without pagination', async () => {
    const sims = [makeSimulation('sim-1'), makeSimulation('sim-2')];
    mockRepo.findAll.mockResolvedValue(sims);

    const result = await useCase.execute();

    expect(result).toEqual(sims);
    expect(mockRepo.findAll.mock.calls).toHaveLength(1);
    expect(mockRepo.findAllPaginated.mock.calls).toHaveLength(0);
  });

  it('should return empty array when no simulations exist', async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('should call findAllPaginated when pagination options are provided', async () => {
    const sims = [makeSimulation('sim-1')];
    const paginated = {
      data: sims,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    mockRepo.findAllPaginated.mockResolvedValue(paginated);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result).toEqual(paginated);
    expect(mockRepo.findAllPaginated.mock.calls[0][0]).toEqual({
      page: 1,
      limit: 10,
    });
    expect(mockRepo.findAll.mock.calls).toHaveLength(0);
  });

  it('should pass pagination options through to repository', async () => {
    const paginated = { data: [], total: 0, page: 2, limit: 5, totalPages: 0 };
    mockRepo.findAllPaginated.mockResolvedValue(paginated);

    await useCase.execute({ page: 2, limit: 5 });

    expect(mockRepo.findAllPaginated.mock.calls[0][0]).toEqual({
      page: 2,
      limit: 5,
    });
  });
});
