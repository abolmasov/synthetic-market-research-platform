import { Inject, Injectable } from '@nestjs/common';
import type { StudyRepository } from '../../domain/study/study.repository';
import { Study, StudyStatus } from '../../domain/study/study';
import { STUDY_REPOSITORY } from '../../common/tokens';

export type UpdateStudyInput = {
  name?: string;
  objective?: string;
  status?: StudyStatus;
  tags?: string[] | null;
};

@Injectable()
export class UpdateStudyUseCase {
  constructor(
    @Inject(STUDY_REPOSITORY)
    private readonly repository: StudyRepository,
  ) {}

  async execute(id: string, input: UpdateStudyInput): Promise<Study | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    const updated = Study.rehydrate({
      id: existing.id ?? id,
      createdAt: existing.createdAt ?? new Date(),
      name: input.name ?? existing.name,
      objective: input.objective ?? existing.objective,
      status: input.status ?? existing.status,
      tags: input.tags !== undefined ? input.tags : (existing.tags ?? null),
    });

    return this.repository.update(updated);
  }
}
