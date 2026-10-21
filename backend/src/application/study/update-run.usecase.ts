import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Run } from '../../domain/study/run';
import type { RunConfig, RunStage, RunStatus } from '../../domain/study/run';
import type { RunRepository } from '../../domain/study/run.repository';
import { RUN_REPOSITORY } from '../../common/tokens';

export type UpdateRunInput = {
  id: string;
  hypothesisId?: string;
  panelId?: string;
  variantIds?: string[];
  stage?: RunStage;
  status?: RunStatus;
  config?: RunConfig;
  startedAt?: string;
  completedAt?: string;
};

@Injectable()
export class UpdateRunUseCase {
  constructor(
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
  ) {}

  async execute(input: UpdateRunInput): Promise<Run> {
    const run = await this.runRepository.findById(input.id);
    if (!run) {
      throw new NotFoundException(`Run with ID ${input.id} not found`);
    }

    const updated = Run.rehydrate({
      id: run.id!,
      hypothesisId: input.hypothesisId ?? run.hypothesisId,
      panelId: input.panelId !== undefined ? input.panelId : run.panelId,
      variantIds: input.variantIds ?? run.variantIds,
      stage: input.stage ?? run.stage,
      status: input.status ?? run.status,
      config: input.config ?? run.config,
      startedAt: input.startedAt ? new Date(input.startedAt) : run.startedAt,
      completedAt: input.completedAt
        ? new Date(input.completedAt)
        : run.completedAt,
      createdAt: run.createdAt!,
    });

    return this.runRepository.update(updated);
  }
}
