import { Injectable, Logger } from '@nestjs/common';
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import { LlmGenerationConfig, LlmProvider } from '../../domain/ai/llm.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VertexLlmProvider implements LlmProvider {
  private readonly logger = new Logger(VertexLlmProvider.name);
  private vertexAi: VertexAI;
  private model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const project = this.configService.get<string>('GOOGLE_CLOUD_PROJECT');
    const location = this.configService.get<string>(
      'VERTEX_AI_LOCATION',
      'us-central1',
    );
    const modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-1.5-pro',
    );

    if (!project) {
      throw new Error(
        'GOOGLE_CLOUD_PROJECT is required when LLM_MODE=vertex. Use LLM_MODE=mock for offline development.',
      );
    }

    this.vertexAi = new VertexAI({
      project,
      location,
    });
    this.model = this.vertexAi.getGenerativeModel({ model: modelName });
  }

  async generateText(
    prompt: string,
    config?: LlmGenerationConfig,
  ): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config?.temperature,
          topP: config?.topP,
          topK: config?.topK,
          maxOutputTokens: config?.maxOutputTokens,
        },
      });

      const response = result.response;
      return response.candidates?.[0].content.parts[0].text ?? '';
    } catch (error) {
      this.logger.error('Error generating text with Vertex AI', error);
      throw error;
    }
  }

  async generateJson<T>(
    prompt: string,
    schema?: object,
    config?: LlmGenerationConfig,
  ): Promise<T> {
    try {
      // For Gemini 1.5, we can use responseMimeType: 'application/json' if supported,
      // or just prompt engineering. Let's use prompt engineering + strict parsing for now
      // as it's more robust across versions unless we configure the model specifically for JSON mode.
      // Actually, Gemini 1.5 supports JSON mode natively.

      const jsonPrompt = `${prompt}\n\nReturn the result as valid JSON.`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: jsonPrompt }] }],
        generationConfig: {
          temperature: config?.temperature ?? 0.1, // Low temp for JSON
          responseMimeType: 'application/json',
        },
      });

      const text =
        result.response.candidates?.[0].content.parts[0].text ?? '{}';
      return JSON.parse(text) as T;
    } catch (error) {
      this.logger.error('Error generating JSON with Vertex AI', error);
      throw error;
    }
  }
}
