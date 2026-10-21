import { Simulation } from './simulation';

describe('Simulation', () => {
  const baseInput = {
    hypothesis: 'Users will pay $49/month for a sleep supplement',
    hypothesisId: 'hyp-1',
    status: 'completed' as const,
    summary: {
      acceptanceRate: 0.6,
      rejectionRate: 0.3,
      maybeRate: 0.1,
      averageConfidence: 0.72,
      avgLoopDepth: 1.5,
      totalPersonas: 10,
    },
    decisions: [
      {
        personaId: 'p1',
        name: 'Alice',
        segment: 'Tech Workers',
        decision: 'accept' as const,
        confidence: 0.8,
        system1: 'This looks promising!',
        system2: 'The price fits my budget and addresses my needs.',
        reasons: ['Good value', 'Trusted brand'],
        loopDepth: 1,
      },
    ],
    ragSources: [
      {
        title: 'Sleep Market Report',
        url: 'https://example.com/report',
        snippet: 'The sleep supplement market is growing...',
        relevanceScore: 0.9,
      },
    ],
    topSignals: ['AI Analysis Completed'],
    objections: ['Too expensive'],
    completedAt: new Date(),
  };

  describe('create', () => {
    it('should create a simulation with all fields', () => {
      const sim = Simulation.create(baseInput);

      expect(sim.hypothesis).toBe(
        'Users will pay $49/month for a sleep supplement',
      );
      expect(sim.hypothesisId).toBe('hyp-1');
      expect(sim.status).toBe('completed');
      expect(sim.summary.acceptanceRate).toBe(0.6);
      expect(sim.summary.totalPersonas).toBe(10);
      expect(sim.decisions).toHaveLength(1);
      expect(sim.decisions[0].decision).toBe('accept');
      expect(sim.ragSources).toHaveLength(1);
      expect(sim.objections).toEqual(['Too expensive']);
    });
  });

  describe('rehydrate', () => {
    it('should reconstruct a simulation from stored data', () => {
      const date = new Date('2025-01-15');
      const sim = Simulation.rehydrate({
        id: 'sim-abc',
        createdAt: date,
        ...baseInput,
      });

      expect(sim.id).toBe('sim-abc');
      expect(sim.createdAt).toBe(date);
    });
  });
});
