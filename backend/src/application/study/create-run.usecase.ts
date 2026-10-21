import { Inject, Injectable } from '@nestjs/common';
import { Run } from '../../domain/study/run';
import type { RunConfig, RunStage, RunStatus } from '../../domain/study/run';
import type { RunRepository } from '../../domain/study/run.repository';
import { RUN_REPOSITORY } from '../../common/tokens';

export type CreateRunInput = {
  hypothesisId: string;
  panelId?: string;
  variantIds: string[];
  stage: RunStage;
  status: RunStatus;
  config: RunConfig;
};

@Injectable()
export class CreateRunUseCase {
  constructor(
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
  ) {}

  async execute(input: CreateRunInput): Promise<Run> {
    const run = Run.create({
      hypothesisId: input.hypothesisId,
      panelId: input.panelId,
      variantIds: input.variantIds,
      stage: input.stage,
      status: input.status,
      config: input.config,
    });
    return this.runRepository.create(run);
  }
}
