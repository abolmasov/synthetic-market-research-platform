import { Inject, Injectable } from '@nestjs/common';
import type { StudyRepository } from '../../domain/study/study.repository';
import { Study, StudyStatus } from '../../domain/study/study';
import { STUDY_REPOSITORY } from '../../common/tokens';

export type CreateStudyInput = {
  workspaceId?: string;
  name: string;
  objective: string;
  status?: StudyStatus;
  tags?: string[] | null;
};

@Injectable()
export class CreateStudyUseCase {
  constructor(
    @Inject(STUDY_REPOSITORY)
    private readonly repository: StudyRepository,
  ) {}

  async execute(input: CreateStudyInput): Promise<Study> {
    const study = Study.create({
      workspaceId: input.workspaceId ?? null,
      name: input.name,
      objective: input.objective,
      status: input.status ?? 'draft',
      tags: input.tags ?? null,
    });

    return this.repository.create(study);
  }
}
