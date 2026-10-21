import { Inject, Injectable } from '@nestjs/common';
import { Artifact } from '../../domain/study/artifact';
import type { ArtifactStage, ArtifactType } from '../../domain/study/artifact';
import type { ArtifactRepository } from '../../domain/study/artifact.repository';
import { ARTIFACT_REPOSITORY } from '../../common/tokens';

export type CreateArtifactInput = {
  runId: string;
  stage: ArtifactStage;
  type: ArtifactType;
  payload: Record<string, unknown>;
};

@Injectable()
export class CreateArtifactUseCase {
  constructor(
    @Inject(ARTIFACT_REPOSITORY)
    private readonly artifactRepository: ArtifactRepository,
  ) {}

  async execute(input: CreateArtifactInput): Promise<Artifact> {
    const artifact = Artifact.create({
      runId: input.runId,
      stage: input.stage,
      type: input.type,
      payload: input.payload,
    });
    return this.artifactRepository.create(artifact);
  }
}
