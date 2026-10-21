import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

/**
 * Runs pending TypeORM migrations on startup.
 * This keeps Cloud Run and local environments in sync without DB_SYNC=true.
 */
@Injectable()
export class MigrationRunnerService implements OnModuleInit {
  private readonly logger = new Logger(MigrationRunnerService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const shouldRun =
      this.configService.get<string>('DB_RUN_MIGRATIONS', 'false') === 'true';

    if (!shouldRun) {
      this.logger.log('Skipping migrations (DB_RUN_MIGRATIONS=false).');
      return;
    }

    try {
      await this.runMigrations();
    } catch (error) {
      this.logger.error('Migration failed', error);
      // Don't crash the app — log and continue
    }
  }

  private async runMigrations() {
    const migrations = await this.dataSource.runMigrations();

    if (migrations.length === 0) {
      this.logger.log('No pending migrations.');
      return;
    }

    const applied = migrations.map((m) => m.name).join(', ');
    this.logger.log(`Applied migrations: ${applied}`);
  }
}
