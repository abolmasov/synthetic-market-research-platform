import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaController } from '../presentation/http/persona.controller';
import { CreatePersonaUseCase } from '../application/persona/create-persona.usecase';
import { ListPersonasUseCase } from '../application/persona/list-personas.usecase';
import { GetPersonaUseCase } from '../application/persona/get-persona.usecase';
import { UpdatePersonaUseCase } from '../application/persona/update-persona.usecase';
import { DeletePersonaUseCase } from '../application/persona/delete-persona.usecase';
import { BulkImportPersonasUseCase } from '../application/persona/bulk-import-personas.usecase';
import { PERSONA_REPOSITORY } from '../common/tokens';
import { TypeormPersonaRepository } from '../infrastructure/persistence/typeorm/persona.repository';
import { PersonaOrmEntity } from '../infrastructure/persistence/typeorm/persona.orm-entity';
import { InMemoryPersonaRepository } from '../infrastructure/persistence/in-memory-persona.repository';
import { isDatabaseEnabled } from '../common/runtime-config';

const personaImports = isDatabaseEnabled
  ? [TypeOrmModule.forFeature([PersonaOrmEntity])]
  : [];
const personaRepository = {
  provide: PERSONA_REPOSITORY,
  useClass: isDatabaseEnabled
    ? TypeormPersonaRepository
    : InMemoryPersonaRepository,
};

@Module({
  imports: personaImports,
  controllers: [PersonaController],
  providers: [
    CreatePersonaUseCase,
    ListPersonasUseCase,
    GetPersonaUseCase,
    UpdatePersonaUseCase,
    DeletePersonaUseCase,
    BulkImportPersonasUseCase,
    personaRepository,
  ],
  exports: [PERSONA_REPOSITORY],
})
export class PersonaModule {}
