import { Injectable, Logger } from '@nestjs/common';
import { LlmGenerationConfig, LlmProvider } from '../../domain/ai/llm.provider';

/**
 * Deterministic offline LLM for local demos and CI when Vertex credentials are unavailable.
 */
@Injectable()
export class MockLlmProvider implements LlmProvider {
  private readonly logger = new Logger(MockLlmProvider.name);

  generateText(prompt: string, _config?: LlmGenerationConfig): Promise<string> {
    this.logger.debug(`Mock generateText (${prompt.length} chars)`);
    const topic = prompt.slice(0, 120).replace(/\s+/g, ' ').trim();
    return Promise.resolve(
      `Based on the scenario (${topic}…), my initial reaction is cautiously positive. I would want clearer proof of value before committing.`,
    );
  }

  generateJson<T>(
    prompt: string,
    _schema?: object,
    _config?: LlmGenerationConfig,
  ): Promise<T> {
    this.logger.debug(`Mock generateJson (${prompt.length} chars)`);
    const lower = prompt.toLowerCase();
    const wantsPersonas =
      lower.includes('persona') || lower.includes('segment');
    const wantsDecision =
      lower.includes('decision') ||
      lower.includes('simulation') ||
      lower.includes('hypothesis');

    if (wantsPersonas) {
      return Promise.resolve({
        personas: [
          {
            name: 'Alex Rivera',
            age: 34,
            occupation: 'Product Manager',
            location: 'Austin, TX',
            income: '$95k',
            traits: ['analytical', 'time-constrained', 'health-conscious'],
            goals: ['Better sleep routine', 'Reduce stress'],
            painPoints: [
              'Skeptical of unsubstantiated claims',
              'Price sensitive',
            ],
            bio: 'Busy professional exploring evidence-backed wellness tools.',
          },
        ],
      } as T);
    }

    if (wantsDecision) {
      const accept = lower.includes('sleep') || lower.includes('wellness');
      return Promise.resolve({
        decision: accept ? 'accept' : 'reject',
        confidence: accept ? 0.72 : 0.58,
        reasoning:
          'Mock reasoning: trade-offs between cost, trust in clinical evidence, and fit with daily routine.',
        system1Response: accept
          ? 'This feels relevant to my goals.'
          : 'I am not convinced this is worth the price.',
        system2Response:
          'I would compare alternatives and look for third-party validation before purchasing.',
        objections: accept
          ? ['Monthly cost', 'Unclear cancellation terms']
          : ['Insufficient proof', 'Better free alternatives exist'],
      } as T);
    }

    return Promise.resolve({
      summary: 'Mock structured response for local development.',
      notes: prompt.slice(0, 200),
    } as T);
  }
}
