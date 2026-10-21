import { Persona } from './persona';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

export interface PersonaRepository {
  create(persona: Persona): Promise<Persona>;
  findAll(workspaceId?: string): Promise<Persona[]>;
  findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedResult<Persona>>;
  findById(id: string, workspaceId?: string): Promise<Persona | null>;
  update(persona: Persona): Promise<Persona>;
  delete(id: string): Promise<boolean>;
}
