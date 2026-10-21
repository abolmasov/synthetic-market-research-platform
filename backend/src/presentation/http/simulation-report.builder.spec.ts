import { Simulation } from '../../domain/simulation/simulation';
import {
  buildSimulationPdf,
  createSimulationReportMetadata,
} from './simulation-report.builder';

describe('simulation-report.builder', () => {
  describe('buildSimulationPdf', () => {
    it('generates a PDF even with unicode-heavy LLM output', async () => {
      const simulation = Simulation.rehydrate({
        id: 'sim-1',
        createdAt: new Date('2026-02-16T00:00:00.000Z'),
        hypothesis:
          '\u201CSmart quotes\u201D \u2014 emoji \u{1F600} \u20AC bullet \u2022 and Zo\u00EB',
        hypothesisId: null,
        status: 'completed',
        summary: {
          acceptanceRate: 0.5,
          rejectionRate: 0.25,
          maybeRate: 0.25,
          averageConfidence: 0.66,
          avgLoopDepth: 1.2,
          totalPersonas: 4,
          segmentBreakdown: [],
          confidenceDistribution: [],
          topAcceptReasons: [],
          topRejectReasons: [],
          objectionFrequency: [],
          avgSentimentScore: 0.5,
          priceAnchorHitRate: 0.5,
        },
        decisions: [
          {
            personaId: 'p1',
            name: 'Zo\u00EB',
            segment: 'Gen Z \u2013 creators',
            age: 20,
            gender: 'female',
            occupation: 'student',
            income: 20000,
            location: 'London',
            decision: 'accept',
            confidence: 0.91,
            system1: 'I love it \u{1F60D}',
            system2: 'It\u2019s \u201Cgreat\u201D \u2014 really.',
            reasons: ['Too pricey \u20AC', '\u2022 bullet point'],
            loopDepth: 2,
            sentimentScore: 0.8,
            priceAnchorHit: true,
          },
        ],
        ragSources: [],
        topSignals: ['Signal \u2713', 'New \u2192 link'],
        objections: ['No\u2014maybe', 'I can\u2019t afford it \u{1F62C}'],
        completedAt: new Date('2026-02-16T00:00:01.000Z'),
      });

      const metadata = createSimulationReportMetadata(simulation);
      const buffer = await buildSimulationPdf(simulation, metadata);

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.toString('utf8', 0, 5)).toBe('%PDF-');
    });
  });
});
