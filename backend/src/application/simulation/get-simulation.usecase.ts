import { Inject, Injectable } from '@nestjs/common';
import type { SimulationRepository } from '../../domain/simulation/simulation.repository';
import { SIMULATION_REPOSITORY } from '../../common/tokens';
import { Simulation } from '../../domain/simulation/simulation';

@Injectable()
export class GetSimulationUseCase {
  constructor(
    @Inject(SIMULATION_REPOSITORY)
    private readonly repository: SimulationRepository,
  ) {}

  async execute(id: string, workspaceId?: string): Promise<Simulation | null> {
    return this.repository.findById(id, workspaceId);
  }
}
