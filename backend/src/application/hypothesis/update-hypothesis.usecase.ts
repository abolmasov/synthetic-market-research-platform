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

export type UpdateHypothesisInput = {
  studyId?: string | null;
  stage?: HypothesisStage;
  title?: string;
  statement?: string;
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
export class UpdateHypothesisUseCase {
  constructor(
    @Inject(HYPOTHESIS_REPOSITORY)
    private readonly repository: HypothesisRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateHypothesisInput,
  ): Promise<Hypothesis | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    const updated = Hypothesis.rehydrate({
      id: existing.id ?? id,
      createdAt: existing.createdAt ?? new Date(),
      studyId:
        input.studyId !== undefined
          ? input.studyId
          : (existing.studyId ?? null),
      stage: input.stage ?? existing.stage,
      title: input.title ?? existing.title,
      statement: input.statement ?? existing.statement,
      status: input.status ?? existing.status,
      successCriteria:
        input.successCriteria !== undefined
          ? input.successCriteria
          : (existing.successCriteria ?? null),
      protocolId:
        input.protocolId !== undefined
          ? input.protocolId
          : (existing.protocolId ?? null),
      primaryMetric:
        input.primaryMetric !== undefined
          ? input.primaryMetric
          : (existing.primaryMetric ?? null),
      primaryMetricDirection:
        input.primaryMetricDirection !== undefined
          ? input.primaryMetricDirection
          : (existing.primaryMetricDirection ?? null),
      primaryMetricThreshold:
        input.primaryMetricThreshold !== undefined
          ? input.primaryMetricThreshold
          : (existing.primaryMetricThreshold ?? null),
      guardrails:
        input.guardrails !== undefined
          ? input.guardrails
          : (existing.guardrails ?? null),
      falsificationRule:
        input.falsificationRule !== undefined
          ? input.falsificationRule
          : (existing.falsificationRule ?? null),
      sampleSize:
        input.sampleSize !== undefined
          ? input.sampleSize
          : (existing.sampleSize ?? null),
      testDurationDays:
        input.testDurationDays !== undefined
          ? input.testDurationDays
          : (existing.testDurationDays ?? null),
      decisionOutcome:
        input.decisionOutcome !== undefined
          ? input.decisionOutcome
          : existing.decisionOutcome,
      decisionReason:
        input.decisionReason !== undefined
          ? input.decisionReason
          : (existing.decisionReason ?? null),
      lastEvaluatedAt:
        input.lastEvaluatedAt !== undefined
          ? input.lastEvaluatedAt
          : (existing.lastEvaluatedAt ?? null),
      notes: input.notes !== undefined ? input.notes : (existing.notes ?? null),
    });

    return this.repository.update(updated);
  }
}
