import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ArtifactRepository } from '../../domain/study/artifact.repository';
import { ARTIFACT_REPOSITORY } from '../../common/tokens';

@Injectable()
export class DeleteArtifactUseCase {
  constructor(
    @Inject(ARTIFACT_REPOSITORY)
    private readonly artifactRepository: ArtifactRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.artifactRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Artifact with ID ${id} not found`);
    }
  }
}
