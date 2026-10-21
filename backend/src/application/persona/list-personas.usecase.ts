import { Inject, Injectable } from '@nestjs/common';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import { PERSONA_REPOSITORY } from '../../common/tokens';
import { Persona } from '../../domain/persona/persona';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

@Injectable()
export class ListPersonasUseCase {
  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly repository: PersonaRepository,
  ) {}

  execute(): Promise<Persona[]>;
  execute(pagination: PaginationOptions): Promise<PaginatedResult<Persona>>;
  execute(
    pagination?: PaginationOptions,
  ): Promise<Persona[] | PaginatedResult<Persona>> {
    if (pagination) {
      return this.repository.findAllPaginated(pagination);
    }
    return this.repository.findAll();
  }
}
