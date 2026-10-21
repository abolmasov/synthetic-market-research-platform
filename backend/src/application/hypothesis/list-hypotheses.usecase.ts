import { Inject, Injectable } from '@nestjs/common';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import { Hypothesis } from '../../domain/hypothesis/hypothesis';
import { HYPOTHESIS_REPOSITORY } from '../../common/tokens';
import type {
  PaginatedResult,
  PaginationOptions,
} from '../../common/pagination';

@Injectable()
export class ListHypothesesUseCase {
  constructor(
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly repository: HypothesisRepository,
  ) {}

  execute(studyId?: string): Promise<Hypothesis[]>;
  execute(
    studyId: string | undefined,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Hypothesis>>;
  execute(
    studyId?: string,
    pagination?: PaginationOptions,
  ): Promise<Hypothesis[] | PaginatedResult<Hypothesis>> {
    if (pagination) {
      return this.repository.findAllPaginated(pagination, studyId);
    }
    if (studyId) {
      return this.repository.findAllByStudy(studyId);
    }
    return this.repository.findAll();
  }
}
