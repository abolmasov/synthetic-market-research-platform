import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationController } from '../presentation/http/simulation.controller';
import { RunSimulationUseCase } from '../application/simulation/run-simulation.usecase';
import { ListSimulationsUseCase } from '../application/simulation/list-simulations.usecase';
import { GetSimulationUseCase } from '../application/simulation/get-simulation.usecase';
import { SIMULATION_REPOSITORY } from '../common/tokens';
import { TypeormSimulationRepository } from '../infrastructure/persistence/typeorm/simulation.repository';
import { SimulationOrmEntity } from '../infrastructure/persistence/typeorm/simulation.orm-entity';
import { PersonaModule } from './persona.module';
import { HypothesisModule } from './hypothesis.module';
import { RagModule } from './rag.module';
import { InMemorySimulationRepository } from '../infrastructure/persistence/in-memory-simulation.repository';
import { isDatabaseEnabled } from '../common/runtime-config';

const simulationImports = isDatabaseEnabled
  ? [TypeOrmModule.forFeature([SimulationOrmEntity])]
  : [];
const simulationRepository = {
  provide: SIMULATION_REPOSITORY,
  useClass: isDatabaseEnabled
    ? TypeormSimulationRepository
    : InMemorySimulationRepository,
};

@Module({
  imports: [...simulationImports, PersonaModule, HypothesisModule, RagModule],
  controllers: [SimulationController],
  providers: [
    RunSimulationUseCase,
    ListSimulationsUseCase,
    GetSimulationUseCase,
    simulationRepository,
  ],
  exports: [SIMULATION_REPOSITORY],
})
export class SimulationModule {}
