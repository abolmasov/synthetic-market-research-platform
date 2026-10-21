import { Inject, Injectable } from '@nestjs/common';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import { PERSONA_REPOSITORY } from '../../common/tokens';
import { Persona } from '../../domain/persona/persona';

@Injectable()
export class GetPersonaUseCase {
  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly repository: PersonaRepository,
  ) {}

  async execute(id: string, workspaceId?: string): Promise<Persona | null> {
    return this.repository.findById(id, workspaceId);
  }
}
