import { Inject, Injectable } from '@nestjs/common';
import type { HypothesisRepository } from '../../domain/hypothesis/hypothesis.repository';
import {
  HypothesisGuardrail,
  HypothesisMetric,
  Hypothesis,
  HypothesisStage,
  HypothesisStatus,
  VerificationDecisionOutcome,
  VerificationDirection,
} from '../../domain/hypothesis/hypothesis';
import { HYPOTHESIS_REPOSITORY } from '../../common/tokens';

export type CreateHypothesisInput = {
  workspaceId?: string | null;
  studyId?: string | null;
  stage?: HypothesisStage;
  title: string;
  statement: string;
  status?: HypothesisStatus;
  successCriteria?: string | null;
  protocolId?: string | null;
  primaryMetric?: HypothesisMetric | null;
  primaryMetricDirection?: VerificationDirection | null;
  primaryMetricThreshold?: number | null;
  guardrails?: HypothesisGuardrail[] | null;
  falsificationRule?: string | null;
  sampleSize?: number | null;
  testDurationDays?: number | null;
  decisionOutcome?: VerificationDecisionOutcome;
  decisionReason?: string | null;
  lastEvaluatedAt?: Date | null;
  notes?: string | null;
};

@Injectable()
export class CreateHypothesisUseCase {
  constructor(
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly repository: HypothesisRepository,
  ) {}

  async execute(input: CreateHypothesisInput): Promise<Hypothesis> {
    const hypothesis = Hypothesis.create({
      workspaceId: input.workspaceId ?? null,
      studyId: input.studyId ?? null,
      stage: input.stage ?? 'H1',
      title: input.title,
      statement: input.statement,
      status: input.status ?? 'draft',
      successCriteria: input.successCriteria ?? null,
      protocolId: input.protocolId ?? null,
      primaryMetric: input.primaryMetric ?? null,
      primaryMetricDirection: input.primaryMetricDirection ?? null,
      primaryMetricThreshold: input.primaryMetricThreshold ?? null,
      guardrails: input.guardrails ?? null,
      falsificationRule: input.falsificationRule ?? null,
      sampleSize: input.sampleSize ?? null,
      testDurationDays: input.testDurationDays ?? null,
      decisionOutcome: input.decisionOutcome ?? 'pending',
      decisionReason: input.decisionReason ?? null,
      lastEvaluatedAt: input.lastEvaluatedAt ?? null,
      notes: input.notes ?? null,
    });

    return this.repository.create(hypothesis);
  }
}
