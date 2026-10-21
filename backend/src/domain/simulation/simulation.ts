import { RagSource } from '../rag/rag-source';

export type SimulationDecision = {
  personaId: string;
  name: string;
  segment: string;
  age: number | null;
  gender: string | null;
  occupation: string | null;
  income: number | null;
  location: string | null;
  decision: 'accept' | 'reject' | 'maybe';
  confidence: number;
  system1: string;
  system2: string;
  reasons: string[];
  loopDepth: number;
  /** Sentiment polarity of the System 1 response: -1 (very negative) to +1 (very positive) */
  sentimentScore: number;
  /** True when the hypothesis price is within the persona's price anchor tolerance */
  priceAnchorHit: boolean;
};

export type SegmentBreakdownEntry = {
  segment: string;
  total: number;
  accept: number;
  reject: number;
  maybe: number;
  acceptRate: number;
  rejectRate: number;
  maybeRate: number;
  avgConfidence: number;
};

export type ConfidenceBucket = {
  label: string;
  min: number;
  max: number;
  count: number;
  rate: number;
};

export type ReasonEntry = {
  reason: string;
  count: number;
};

export type SimulationSummary = {
  // Core rates
  acceptanceRate: number;
  rejectionRate: number;
  maybeRate: number;
  averageConfidence: number;
  avgLoopDepth: number;
  totalPersonas: number;
  // Rich analytics
  segmentBreakdown: SegmentBreakdownEntry[];
  confidenceDistribution: ConfidenceBucket[];
  topAcceptReasons: ReasonEntry[];
  topRejectReasons: ReasonEntry[];
  objectionFrequency: ReasonEntry[];
  avgSentimentScore: number;
  priceAnchorHitRate: number;
};

export type SimulationProps = {
  id?: string;
  workspaceId?: string | null;
  hypothesis: string;
  hypothesisId?: string | null;
  status: 'running' | 'completed';
  summary: SimulationSummary;
  decisions: SimulationDecision[];
  ragSources: RagSource[];
  topSignals: string[];
  objections: string[];
  createdAt?: Date;
  completedAt?: Date | null;
};

export class Simulation {
  constructor(private readonly props: SimulationProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get workspaceId(): string | null | undefined {
    return this.props.workspaceId;
  }

  get hypothesis(): string {
    return this.props.hypothesis;
  }

  get hypothesisId(): string | null | undefined {
    return this.props.hypothesisId;
  }

  get status(): 'running' | 'completed' {
    return this.props.status;
  }

  get summary(): SimulationSummary {
    return this.props.summary;
  }

  get decisions(): SimulationDecision[] {
    return this.props.decisions;
  }

  get ragSources(): RagSource[] {
    return this.props.ragSources;
  }

  get topSignals(): string[] {
    return this.props.topSignals;
  }

  get objections(): string[] {
    return this.props.objections;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get completedAt(): Date | null | undefined {
    return this.props.completedAt;
  }

  static create(input: Omit<SimulationProps, 'id' | 'createdAt'>): Simulation {
    return new Simulation({ ...input });
  }

  static rehydrate(
    props: Required<Pick<SimulationProps, 'id' | 'createdAt'>> &
      Omit<SimulationProps, 'id' | 'createdAt'>,
  ): Simulation {
    return new Simulation(props);
  }
}
