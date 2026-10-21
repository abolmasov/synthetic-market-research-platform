import { Inject, Injectable } from '@nestjs/common';
import type { StudyRepository } from '../../domain/study/study.repository';
import { Study } from '../../domain/study/study';
import { STUDY_REPOSITORY } from '../../common/tokens';

@Injectable()
export class GetStudyUseCase {
  constructor(
    @Inject(STUDY_REPOSITORY)
    private readonly repository: StudyRepository,
  ) {}

  async execute(id: string, workspaceId?: string): Promise<Study | null> {
    return this.repository.findById(id, workspaceId);
  }
}
