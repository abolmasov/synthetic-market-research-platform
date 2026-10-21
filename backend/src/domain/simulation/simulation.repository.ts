import { Simulation } from './simulation';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

export interface SimulationRepository {
  create(simulation: Simulation): Promise<Simulation>;
  findAll(workspaceId?: string): Promise<Simulation[]>;
  findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Simulation>>;
  findById(id: string, workspaceId?: string): Promise<Simulation | null>;
  delete(id: string): Promise<boolean>;
}
