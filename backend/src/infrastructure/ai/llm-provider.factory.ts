import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_PROVIDER } from '../../common/tokens';
import { MockLlmProvider } from './mock-llm.provider';
import { VertexLlmProvider } from './vertex-llm.provider';

export type LlmMode = 'vertex' | 'mock';

export function resolveLlmMode(config: ConfigService): LlmMode {
  const explicit = config.get<string>('LLM_MODE')?.trim().toLowerCase();
  if (explicit === 'mock' || explicit === 'vertex') {
    return explicit;
  }
  const project = config.get<string>('GOOGLE_CLOUD_PROJECT')?.trim();
  return project ? 'vertex' : 'mock';
}

export const llmProviderFactory: Provider = {
  provide: LLM_PROVIDER,
  useFactory: (config: ConfigService) => {
    const mode = resolveLlmMode(config);
    return mode === 'mock'
      ? new MockLlmProvider()
      : new VertexLlmProvider(config);
  },
  inject: [ConfigService],
};
