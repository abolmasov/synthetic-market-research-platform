import { Inject, Injectable } from '@nestjs/common';
import type { StudyRepository } from '../../domain/study/study.repository';
import { Study } from '../../domain/study/study';
import { STUDY_REPOSITORY } from '../../common/tokens';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

@Injectable()
export class ListStudiesUseCase {
  constructor(
    @Inject(STUDY_REPOSITORY)
    private readonly repository: StudyRepository,
  ) {}

  execute(): Promise<Study[]>;
  execute(pagination: PaginationOptions): Promise<PaginatedResult<Study>>;
  execute(
    pagination?: PaginationOptions,
  ): Promise<Study[] | PaginatedResult<Study>> {
    if (pagination) {
      return this.repository.findAllPaginated(pagination);
    }
    return this.repository.findAll();
  }
}
