import { Inject, Injectable } from '@nestjs/common';
import type { SimulationRepository } from '../../domain/simulation/simulation.repository';
import { SIMULATION_REPOSITORY } from '../../common/tokens';
import { Simulation } from '../../domain/simulation/simulation';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

@Injectable()
export class ListSimulationsUseCase {
  constructor(
    @Inject(SIMULATION_REPOSITORY)
    private readonly repository: SimulationRepository,
  ) {}

  execute(): Promise<Simulation[]>;
  execute(pagination: PaginationOptions): Promise<PaginatedResult<Simulation>>;
  execute(
    pagination?: PaginationOptions,
  ): Promise<Simulation[] | PaginatedResult<Simulation>> {
    if (pagination) {
      return this.repository.findAllPaginated(pagination);
    }
    return this.repository.findAll();
  }
}
