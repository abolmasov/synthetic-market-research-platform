export interface LlmGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

export interface LlmProvider {
  generateText(prompt: string, config?: LlmGenerationConfig): Promise<string>;
  generateJson<T>(
    prompt: string,
    schema?: object,
    config?: LlmGenerationConfig,
  ): Promise<T>;
}
