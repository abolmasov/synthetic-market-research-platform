import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { llmProviderFactory } from '../infrastructure/ai/llm-provider.factory';
import { LLM_PROVIDER } from '../common/tokens';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [llmProviderFactory],
  exports: [LLM_PROVIDER],
})
export class AiModule {}
