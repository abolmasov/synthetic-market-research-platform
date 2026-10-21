import { Inject, Injectable } from '@nestjs/common';
import type { PersonaRepository } from '../../domain/persona/persona.repository';
import { PERSONA_REPOSITORY } from '../../common/tokens';

@Injectable()
export class DeletePersonaUseCase {
  constructor(
    @Inject(PERSONA_REPOSITORY)
    private readonly repository: PersonaRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
