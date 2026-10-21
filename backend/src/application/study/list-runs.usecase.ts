import { Inject, Injectable } from '@nestjs/common';
import { Run } from '../../domain/study/run';
import type { RunRepository } from '../../domain/study/run.repository';
import { RUN_REPOSITORY } from '../../common/tokens';

@Injectable()
export class ListRunsUseCase {
  constructor(
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
  ) {}

  async execute(hypothesisId: string): Promise<Run[]> {
    return this.runRepository.findAllByHypothesis(hypothesisId);
  }
}
