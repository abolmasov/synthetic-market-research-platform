import { Module } from '@nestjs/common';
import { SeedService } from '../infrastructure/persistence/seed/seed.service';
import { PersonaModule } from './persona.module';
import { SegmentModule } from './segment.module';
import { HypothesisModule } from './hypothesis.module';
import { SimulationModule } from './simulation.module';
import { RagModule } from './rag.module';
import { SeedController } from '../presentation/http/seed.controller';

@Module({
  imports: [
    PersonaModule,
    SegmentModule,
    HypothesisModule,
    SimulationModule,
    RagModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
