import { Module } from '@nestjs/common';
import { HealthController } from '../presentation/http/health.controller';
import { HealthService } from '../application/health/health.service';
import { isDatabaseEnabled } from '../common/runtime-config';
import { TypeormDatabaseModule } from '../infrastructure/database/typeorm.module';

const databaseImports = isDatabaseEnabled ? [TypeormDatabaseModule] : [];

@Module({
  imports: [...databaseImports],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
