export type HypothesisStage = 'H1' | 'H2' | 'H3';
export type HypothesisMetric =
  | 'acceptanceRate'
  | 'rejectionRate'
  | 'maybeRate'
  | 'averageConfidence'
  | 'priceAnchorHitRate';
export type VerificationDirection = 'at_least' | 'at_most';
export type VerificationDecisionOutcome =
  'pending' | 'pass' | 'iterate' | 'kill';
export type HypothesisStatus =
  | 'draft'
  | 'ready'
  | 'running'
  | 'completed'
  | 'canceled'
  | 'active'
  | 'archived';

export type HypothesisGuardrail = {
  metric: HypothesisMetric;
  direction: VerificationDirection;
  threshold: number;
  label?: string | null;
};

export type HypothesisProps = {
  id?: string;
  workspaceId?: string | null;
  studyId?: string | null;
  stage: HypothesisStage;
  title: string;
  statement: string;
  status: HypothesisStatus;
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
  createdAt?: Date;
};

export class Hypothesis {
  constructor(private readonly props: HypothesisProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get workspaceId(): string | null | undefined {
    return this.props.workspaceId;
  }

  get studyId(): string | null | undefined {
    return this.props.studyId;
  }

  get stage(): HypothesisStage {
    return this.props.stage;
  }

  get title(): string {
    return this.props.title;
  }

  get statement(): string {
    return this.props.statement;
  }

  get status(): HypothesisStatus {
    return this.props.status;
  }

  get successCriteria(): string | null | undefined {
    return this.props.successCriteria;
  }

  get protocolId(): string | null | undefined {
    return this.props.protocolId;
  }

  get primaryMetric(): HypothesisMetric | null | undefined {
    return this.props.primaryMetric;
  }

  get primaryMetricDirection(): VerificationDirection | null | undefined {
    return this.props.primaryMetricDirection;
  }

  get primaryMetricThreshold(): number | null | undefined {
    return this.props.primaryMetricThreshold;
  }

  get guardrails(): HypothesisGuardrail[] | null | undefined {
    return this.props.guardrails;
  }

  get falsificationRule(): string | null | undefined {
    return this.props.falsificationRule;
  }

  get sampleSize(): number | null | undefined {
    return this.props.sampleSize;
  }

  get testDurationDays(): number | null | undefined {
    return this.props.testDurationDays;
  }

  get decisionOutcome(): VerificationDecisionOutcome | undefined {
    return this.props.decisionOutcome;
  }

  get decisionReason(): string | null | undefined {
    return this.props.decisionReason;
  }

  get lastEvaluatedAt(): Date | null | undefined {
    return this.props.lastEvaluatedAt;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  static create(input: Omit<HypothesisProps, 'id' | 'createdAt'>): Hypothesis {
    return new Hypothesis({
      ...input,
      decisionOutcome: input.decisionOutcome ?? 'pending',
    });
  }

  static rehydrate(
    props: Required<Pick<HypothesisProps, 'id' | 'createdAt'>> &
      Omit<HypothesisProps, 'id' | 'createdAt'>,
  ): Hypothesis {
    return new Hypothesis(props);
  }
}
