import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';

type EmbeddingPayload = {
  embeddings?: {
    values?: unknown;
  };
};

@Injectable()
export class VertexEmbeddingService {
  private readonly logger = new Logger(VertexEmbeddingService.name);
  private readonly client: PredictionServiceClient;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    const project = this.configService.get<string>('GOOGLE_CLOUD_PROJECT');
    if (!project) {
      throw new Error(
        'GOOGLE_CLOUD_PROJECT is required for pgvector RAG embeddings.',
      );
    }
    const location = this.configService.get<string>(
      'VERTEX_AI_LOCATION',
      'us-central1',
    );
    const model = this.configService.get<string>(
      'RAG_EMBEDDING_MODEL',
      'text-embedding-005',
    );

    this.client = new PredictionServiceClient({
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
    });
    this.endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
  }

  async embed(text: string): Promise<number[]> {
    const results = await this.embedBatch([text]);
    return results[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const instances: unknown[] = texts.map((text) =>
      this.toVertexValue({ content: text }),
    );

    const parameters = this.toVertexValue({ outputDimensionality: 768 });

    try {
      const [response] = await this.client.predict({
        endpoint: this.endpoint,
        instances: instances as never[],
        parameters: parameters as never,
      });

      const embeddings: number[][] = [];

      for (const prediction of response.predictions ?? []) {
        const values = this.extractEmbeddingValues(prediction);
        if (values) {
          embeddings.push(values);
        }
      }

      this.logger.log(
        `Embedded ${texts.length} text(s), dimensions: ${embeddings[0]?.length ?? 0}`,
      );
      return embeddings;
    } catch (error) {
      this.logger.error('Error generating embeddings with Vertex AI', error);
      throw error;
    }
  }

  private toVertexValue(input: Record<string, unknown>): unknown {
    return helpers.toValue(input);
  }

  private extractEmbeddingValues(prediction: unknown): number[] | null {
    const decoded = helpers.fromValue(prediction as never) as unknown;

    if (!this.isEmbeddingPayload(decoded)) {
      return null;
    }

    const values = decoded.embeddings?.values;
    if (!Array.isArray(values)) {
      return null;
    }

    const numericValues = values.filter(
      (value): value is number => typeof value === 'number',
    );

    return numericValues.length > 0 ? numericValues : null;
  }

  private isEmbeddingPayload(value: unknown): value is EmbeddingPayload {
    return typeof value === 'object' && value !== null;
  }
}
