import { Injectable } from '@nestjs/common';
import { RagSourceProvider } from '../../domain/rag/rag-source.provider';
import { RagSource } from '../../domain/rag/rag-source';

const BASE_SOURCES: RagSource[] = [
  {
    title: 'Demo market report: sleep economy trends',
    url: 'https://example.com/research/sleep-economy',
    snippet:
      'Consumers with high stress show stronger intent for guided sleep improvement products.',
    relevanceScore: 0.86,
  },
  {
    title: 'Demo survey: supplement trust factors',
    url: 'https://example.com/research/supplement-trust',
    snippet:
      'Clinical proof and transparent ingredient lists are top conversion drivers.',
    relevanceScore: 0.79,
  },
  {
    title: 'Wellness subscription benchmarks',
    url: 'https://example.com/research/wellness-subscriptions',
    snippet:
      'Subscription models improve retention when paired with personalized onboarding.',
    relevanceScore: 0.74,
  },
  {
    title: 'Price sensitivity in digital health',
    url: 'https://example.com/research/price-sensitivity',
    snippet:
      'Most buyers hesitate above $50/month without a clear ROI or trial period.',
    relevanceScore: 0.71,
  },
];

@Injectable()
export class InMemoryRagSourceProvider implements RagSourceProvider {
  query(hypothesis: string): Promise<RagSource[]> {
    const normalized = hypothesis.toLowerCase();
    const bias =
      normalized.includes('sleep') || normalized.includes('insomnia')
        ? 0.05
        : 0;

    return Promise.resolve(
      BASE_SOURCES.map((source) => ({
        ...source,
        relevanceScore: Number(
          Math.min(0.95, source.relevanceScore + bias).toFixed(2),
        ),
      })),
    );
  }
}
