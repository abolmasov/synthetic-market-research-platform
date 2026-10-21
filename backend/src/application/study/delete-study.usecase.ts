import { Inject, Injectable } from '@nestjs/common';
import type { StudyRepository } from '../../domain/study/study.repository';
import { STUDY_REPOSITORY } from '../../common/tokens';

@Injectable()
export class DeleteStudyUseCase {
  constructor(
    @Inject(STUDY_REPOSITORY)
    private readonly repository: StudyRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
