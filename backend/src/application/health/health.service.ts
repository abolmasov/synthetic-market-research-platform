import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { isDatabaseEnabled } from '../../common/runtime-config';

export type HealthStatus = 'healthy' | 'unhealthy' | 'not_configured';

export type ComponentHealth = {
  status: HealthStatus;
  latencyMs?: number;
  error?: string;
};

export type HealthCheckResult = {
  status: 'ok' | 'error';
  overallStatus: HealthStatus;
  timestamp: string;
  version: string;
  components: {
    database: ComponentHealth;
    vertexAI: ComponentHealth;
  };
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly version: string;

  constructor(
    private readonly configService: ConfigService,
    @Optional() private readonly dataSource: DataSource | null,
  ) {
    this.version = process.env.npm_package_version ?? '0.0.1';
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const [database, vertexAI] = await Promise.all([
      this.checkDatabase(),
      this.checkVertexAI(),
    ]);

    const overallStatus = this.determineOverallStatus(database);

    return {
      status: overallStatus === 'unhealthy' ? 'error' : 'ok',
      overallStatus,
      timestamp: new Date().toISOString(),
      version: this.version,
      components: {
        database,
        vertexAI,
      },
    };
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    if (!isDatabaseEnabled || !this.dataSource) {
      return { status: 'not_configured' };
    }

    const start = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'healthy',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkVertexAI(): Promise<ComponentHealth> {
    const project = this.configService.get<string>('GOOGLE_CLOUD_PROJECT');

    if (!project) {
      return { status: 'not_configured' };
    }

    const start = Date.now();
    try {
      const { VertexAI } = await import('@google-cloud/vertexai');
      const location = this.configService.get<string>(
        'VERTEX_AI_LOCATION',
        'us-central1',
      );

      const vertexAi = new VertexAI({ project, location });
      const model = vertexAi.getGenerativeModel({ model: 'gemini-1.5-pro' });

      await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 1 },
      });

      return {
        status: 'healthy',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Vertex AI health check failed', error);
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private determineOverallStatus(database: ComponentHealth): HealthStatus {
    if (database.status === 'unhealthy') {
      return 'unhealthy';
    }
    if (database.status === 'not_configured') {
      return 'not_configured';
    }
    return 'healthy';
  }
}
