import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeormDatabaseModule } from './infrastructure/database/typeorm.module';
import { AuthModule } from './modules/auth.module';
import { PersonaModule } from './modules/persona.module';
import { HealthModule } from './modules/health.module';
import { RagModule } from './modules/rag.module';
import { SimulationModule } from './modules/simulation.module';
import { HypothesisModule } from './modules/hypothesis.module';
import { SeedModule } from './modules/seed.module';
import { AiModule } from './modules/ai.module';
import { SegmentModule } from './modules/segment.module';
import { StudyModule } from './modules/study.module';
import { isDatabaseEnabled } from './common/runtime-config';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/http/guards/roles.guard';

const databaseImports = isDatabaseEnabled ? [TypeormDatabaseModule] : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 10 },
        { name: 'medium', ttl: 60000, limit: 100 },
      ],
    }),
    ...databaseImports,
    AuthModule,
    AiModule,
    PersonaModule,
    HealthModule,
    RagModule,
    HypothesisModule,
    SimulationModule,
    SegmentModule,
    StudyModule,
    SeedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
