import { GetSimulationUseCase } from './get-simulation.usecase';
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

describe('GetSimulationUseCase', () => {
  let useCase: GetSimulationUseCase;
  let mockRepo: jest.Mocked<SimulationRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetSimulationUseCase(mockRepo);
  });

  it('should return a simulation by id', async () => {
    const sim = makeSimulation('sim-abc');
    mockRepo.findById.mockResolvedValue(sim);

    const result = await useCase.execute('sim-abc');

    expect(result).toBe(sim);
    expect(mockRepo.findById.mock.calls[0][0]).toBe('sim-abc');
  });

  it('should return null when simulation is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute('non-existent');

    expect(result).toBeNull();
  });

  it('should pass the correct id to the repository', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await useCase.execute('specific-id-123');

    expect(mockRepo.findById.mock.calls[0][0]).toBe('specific-id-123');
    expect(mockRepo.findById.mock.calls).toHaveLength(1);
  });
});
