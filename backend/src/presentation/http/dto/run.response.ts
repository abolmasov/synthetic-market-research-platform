import { Run, RunConfig, RunStage, RunStatus } from '../../../domain/study/run';

export type RunResponse = {
  id: string;
  hypothesisId: string;
  panelId: string | null;
  variantIds: string[];
  stage: RunStage;
  status: RunStatus;
  config: RunConfig;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export const toRunResponse = (run: Run): RunResponse => ({
  id: run.id ?? '',
  hypothesisId: run.hypothesisId,
  panelId: run.panelId ?? null,
  variantIds: run.variantIds,
  stage: run.stage,
  status: run.status,
  config: run.config,
  startedAt: run.startedAt?.toISOString() ?? null,
  completedAt: run.completedAt?.toISOString() ?? null,
  createdAt: run.createdAt?.toISOString() ?? new Date().toISOString(),
});
