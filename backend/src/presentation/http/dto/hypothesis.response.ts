import {
  Hypothesis,
  HypothesisGuardrail,
  HypothesisMetric,
  VerificationDecisionOutcome,
  VerificationDirection,
} from '../../../domain/hypothesis/hypothesis';

export type HypothesisResponse = {
  id: string;
  studyId: string | null;
  stage: string;
  title: string;
  statement: string;
  status: string;
  successCriteria: string | null;
  protocolId: string | null;
  primaryMetric: HypothesisMetric | null;
  primaryMetricDirection: VerificationDirection | null;
  primaryMetricThreshold: number | null;
  guardrails: HypothesisGuardrail[];
  falsificationRule: string | null;
  sampleSize: number | null;
  testDurationDays: number | null;
  decisionOutcome: VerificationDecisionOutcome;
  decisionReason: string | null;
  lastEvaluatedAt: string | null;
  notes: string | null;
  createdAt: string;
};

export const toHypothesisResponse = (
  hypothesis: Hypothesis,
): HypothesisResponse => ({
  id: hypothesis.id ?? '',
  studyId: hypothesis.studyId ?? null,
  stage: hypothesis.stage,
  title: hypothesis.title,
  statement: hypothesis.statement,
  status: hypothesis.status,
  successCriteria: hypothesis.successCriteria ?? null,
  protocolId: hypothesis.protocolId ?? null,
  primaryMetric: hypothesis.primaryMetric ?? null,
  primaryMetricDirection: hypothesis.primaryMetricDirection ?? null,
  primaryMetricThreshold: hypothesis.primaryMetricThreshold ?? null,
  guardrails: hypothesis.guardrails ?? [],
  falsificationRule: hypothesis.falsificationRule ?? null,
  sampleSize: hypothesis.sampleSize ?? null,
  testDurationDays: hypothesis.testDurationDays ?? null,
  decisionOutcome: hypothesis.decisionOutcome ?? 'pending',
  decisionReason: hypothesis.decisionReason ?? null,
  lastEvaluatedAt: hypothesis.lastEvaluatedAt?.toISOString() ?? null,
  notes: hypothesis.notes ?? null,
  createdAt: hypothesis.createdAt?.toISOString() ?? new Date().toISOString(),
});
