import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyController } from '../presentation/http/study.controller';
import { RunController } from '../presentation/http/run.controller';
import { ArtifactController } from '../presentation/http/artifact.controller';
import { CreateStudyUseCase } from '../application/study/create-study.usecase';
import { ListStudiesUseCase } from '../application/study/list-studies.usecase';
import { GetStudyUseCase } from '../application/study/get-study.usecase';
import { UpdateStudyUseCase } from '../application/study/update-study.usecase';
import { DeleteStudyUseCase } from '../application/study/delete-study.usecase';
import { CreateRunUseCase } from '../application/study/create-run.usecase';
import { ListRunsUseCase } from '../application/study/list-runs.usecase';
import { GetRunUseCase } from '../application/study/get-run.usecase';
import { UpdateRunUseCase } from '../application/study/update-run.usecase';
import { DeleteRunUseCase } from '../application/study/delete-run.usecase';
import { CreateArtifactUseCase } from '../application/study/create-artifact.usecase';
import { ListArtifactsUseCase } from '../application/study/list-artifacts.usecase';
import { DeleteArtifactUseCase } from '../application/study/delete-artifact.usecase';
import {
  STUDY_REPOSITORY,
  RUN_REPOSITORY,
  ARTIFACT_REPOSITORY,
} from '../common/tokens';
import { InMemoryStudyRepository } from '../infrastructure/persistence/in-memory-study.repository';
import { TypeormStudyRepository } from '../infrastructure/persistence/typeorm/study.repository';
import { StudyOrmEntity } from '../infrastructure/persistence/typeorm/study.orm-entity';
import { InMemoryRunRepository } from '../infrastructure/persistence/in-memory-run.repository';
import { TypeormRunRepository } from '../infrastructure/persistence/typeorm/run.repository';
import { RunOrmEntity } from '../infrastructure/persistence/typeorm/run.orm-entity';
import { InMemoryArtifactRepository } from '../infrastructure/persistence/in-memory-artifact.repository';
import { TypeormArtifactRepository } from '../infrastructure/persistence/typeorm/artifact.repository';
import { ArtifactOrmEntity } from '../infrastructure/persistence/typeorm/artifact.orm-entity';
import { isDatabaseEnabled } from '../common/runtime-config';

const studyImports = isDatabaseEnabled
  ? [
      TypeOrmModule.forFeature([
        StudyOrmEntity,
        RunOrmEntity,
        ArtifactOrmEntity,
      ]),
    ]
  : [];
const studyRepository = {
  provide: STUDY_REPOSITORY,
  useClass: isDatabaseEnabled
    ? TypeormStudyRepository
    : InMemoryStudyRepository,
};
const runRepository = {
  provide: RUN_REPOSITORY,
  useClass: isDatabaseEnabled ? TypeormRunRepository : InMemoryRunRepository,
};
const artifactRepository = {
  provide: ARTIFACT_REPOSITORY,
  useClass: isDatabaseEnabled
    ? TypeormArtifactRepository
    : InMemoryArtifactRepository,
};

@Module({
  imports: [...studyImports],
  controllers: [StudyController, RunController, ArtifactController],
  providers: [
    CreateStudyUseCase,
    ListStudiesUseCase,
    GetStudyUseCase,
    UpdateStudyUseCase,
    DeleteStudyUseCase,
    CreateRunUseCase,
    ListRunsUseCase,
    GetRunUseCase,
    UpdateRunUseCase,
    DeleteRunUseCase,
    CreateArtifactUseCase,
    ListArtifactsUseCase,
    DeleteArtifactUseCase,
    studyRepository,
    runRepository,
    artifactRepository,
  ],
  exports: [STUDY_REPOSITORY, RUN_REPOSITORY, ARTIFACT_REPOSITORY],
})
export class StudyModule {}
