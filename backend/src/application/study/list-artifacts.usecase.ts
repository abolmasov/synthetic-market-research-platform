import { Inject, Injectable } from '@nestjs/common';
import { Artifact } from '../../domain/study/artifact';
import type { ArtifactRepository } from '../../domain/study/artifact.repository';
import { ARTIFACT_REPOSITORY } from '../../common/tokens';

@Injectable()
export class ListArtifactsUseCase {
  constructor(
    @Inject(ARTIFACT_REPOSITORY)
    private readonly artifactRepository: ArtifactRepository,
  ) {}

  async execute(runId: string): Promise<Artifact[]> {
    return this.artifactRepository.findAllByRun(runId);
  }
}
