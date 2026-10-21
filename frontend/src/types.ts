// ── Pagination ──────────────────────────────────────────────

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// OCEAN Personality traits (0-100 scale)
export type PersonalityProfile = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

// Health-related attributes (0-10 scale for severity)
export type HealthProfile = {
  insomniaSeverity: number;
  anxietyLevel: number;
  chronicPain: number;
  currentSupplements: string[];
};

// Cognitive biases (0-1 scale)
export type CognitiveProfile = {
  lossAversion: number;
  authorityBias: number;
  socialProof: number;
  statusQuoBias: number;
  anchoring: number;
  confirmationBias: number;
};

// Decision-making style
export type DecisionStyle = {
  system1Weight: number; // 0-1, higher = more intuitive
  priceAnchor: number; // reference price point
  riskTolerance: number; // 0-1
};

export type Gender = 'male' | 'female' | 'non-binary' | 'other';

export type Persona = {
  id: string;
  name: string;
  segment: string;
  segmentId: string | null;
  motivations: string[];
  barriers: string[];
  trustChannel: string;
  purchaseTriggers: string[];
  budgetRange: string;
  contextNotes: string | null;
  age: number | null;
  location: string | null;
  income: number | null;
  createdAt: string;
  // Extended fields
  gender: Gender | null;
  occupation: string | null;
  personality: PersonalityProfile | null;
  healthProfile: HealthProfile | null;
  cognitiveProfile: CognitiveProfile | null;
  decisionStyle: DecisionStyle | null;
};

export type CreatePersonaInput = {
  name: string;
  segment: string;
  motivations: string[];
  barriers: string[];
  trustChannel: string;
  purchaseTriggers: string[];
  budgetRange: string;
  contextNotes?: string;
  age?: number;
  location?: string;
  income?: number;
  // Extended fields
  gender?: Gender;
  occupation?: string;
  personality?: PersonalityProfile;
  healthProfile?: HealthProfile;
  cognitiveProfile?: CognitiveProfile;
  decisionStyle?: DecisionStyle;
};

export type UpdatePersonaInput = {
  name?: string;
  segment?: string;
  motivations?: string[];
  barriers?: string[];
  trustChannel?: string;
  purchaseTriggers?: string[];
  budgetRange?: string;
  contextNotes?: string | null;
  age?: number | null;
  location?: string | null;
  income?: number | null;
  // Extended fields
  gender?: Gender | null;
  occupation?: string | null;
  personality?: PersonalityProfile | null;
  healthProfile?: HealthProfile | null;
  cognitiveProfile?: CognitiveProfile | null;
  decisionStyle?: DecisionStyle | null;
};

export type RagSource = {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
};

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
  sentimentScore: number;
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
  acceptanceRate: number;
  rejectionRate: number;
  maybeRate: number;
  averageConfidence: number;
  avgLoopDepth: number;
  totalPersonas: number;
  segmentBreakdown: SegmentBreakdownEntry[];
  confidenceDistribution: ConfidenceBucket[];
  topAcceptReasons: ReasonEntry[];
  topRejectReasons: ReasonEntry[];
  objectionFrequency: ReasonEntry[];
  avgSentimentScore: number;
  priceAnchorHitRate: number;
};

export type Simulation = {
  id: string;
  hypothesis: string;
  hypothesisId: string | null;
  status: string;
  summary: SimulationSummary;
  decisions: SimulationDecision[];
  ragSources: RagSource[];
  topSignals: string[];
  objections: string[];
  createdAt: string;
  completedAt: string | null;
};

export type RunSimulationInput = {
  hypothesis: string;
  hypothesisId?: string;
  personaIds?: string[];
  maxIterations?: number;
};

// ── Hypothesis ──────────────────────────────────────────────

export type HypothesisStage = 'H1' | 'H2' | 'H3';
export type HypothesisStatus =
  | 'draft'
  | 'ready'
  | 'running'
  | 'completed'
  | 'canceled'
  | 'active'
  | 'archived';

export type HypothesisMetric =
  | 'acceptanceRate'
  | 'rejectionRate'
  | 'maybeRate'
  | 'averageConfidence'
  | 'priceAnchorHitRate';

export type VerificationDirection = 'at_least' | 'at_most';
export type VerificationDecisionOutcome = 'pending' | 'pass' | 'iterate' | 'kill';

export type HypothesisGuardrail = {
  metric: HypothesisMetric;
  direction: VerificationDirection;
  threshold: number;
  label?: string | null;
};

export type Hypothesis = {
  id: string;
  studyId: string | null;
  stage: HypothesisStage;
  title: string;
  statement: string;
  status: HypothesisStatus;
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

export type CreateHypothesisInput = {
  studyId?: string;
  stage?: HypothesisStage;
  title: string;
  statement: string;
  status?: HypothesisStatus;
  successCriteria?: string;
  protocolId?: string;
  primaryMetric?: HypothesisMetric;
  primaryMetricDirection?: VerificationDirection;
  primaryMetricThreshold?: number;
  guardrails?: HypothesisGuardrail[];
  falsificationRule?: string;
  sampleSize?: number;
  testDurationDays?: number;
  decisionOutcome?: VerificationDecisionOutcome;
  decisionReason?: string;
  notes?: string;
};

export type UpdateHypothesisInput = {
  studyId?: string | null;
  stage?: HypothesisStage;
  title?: string;
  statement?: string;
  status?: HypothesisStatus;
  successCriteria?: string;
  protocolId?: string;
  primaryMetric?: HypothesisMetric | null;
  primaryMetricDirection?: VerificationDirection | null;
  primaryMetricThreshold?: number | null;
  guardrails?: HypothesisGuardrail[];
  falsificationRule?: string | null;
  sampleSize?: number | null;
  testDurationDays?: number | null;
  decisionOutcome?: VerificationDecisionOutcome;
  decisionReason?: string | null;
  notes?: string;
};

export type VariantStatus = 'draft' | 'shortlisted' | 'rejected' | 'tested';

export type Variant = {
  id: string;
  hypothesisId: string;
  name: string;
  description: string | null;
  pricePoint: number | null;
  positioning: string | null;
  claims: string[] | null;
  changeSummary: string;
  content: string;
  version: number;
  status: VariantStatus;
  expectedUplift: number | null;
  successMetric: string | null;
  risk: string | null;
  notes: string | null;
  createdAt: string;
};

export type CreateVariantInput = {
  name: string;
  description?: string;
  pricePoint?: number;
  positioning?: string;
  claims?: string[];
  changeSummary: string;
  content: string;
  status?: VariantStatus;
  expectedUplift?: number;
  successMetric?: string;
  risk?: string;
  notes?: string;
};

export type UpdateVariantInput = Partial<CreateVariantInput>;

export type RunStage = 'H1' | 'H2' | 'H3';
export type RunStatus = 'queued' | 'running' | 'completed' | 'failed';

export type RunConfig = {
  llmModel?: string | null;
  temperature?: number | null;
  promptVersion?: string | null;
  ragIndexVersion?: string | null;
  maxTokens?: number | null;
  system1Weight?: number | null;
  system2Weight?: number | null;
  [key: string]: unknown;
};

export type Run = {
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

export type CreateRunInput = {
  hypothesisId: string;
  panelId?: string;
  variantIds: string[];
  stage: RunStage;
  status: RunStatus;
  config: RunConfig;
};

export type UpdateRunInput = {
  hypothesisId?: string;
  panelId?: string;
  variantIds?: string[];
  stage?: RunStage;
  status?: RunStatus;
  config?: RunConfig;
  startedAt?: string;
  completedAt?: string;
};

// ── Segment ─────────────────────────────────────────────────

export type DemographicCriteria = {
  ageRange: { min: number; max: number };
  incomeRange: { min: number; max: number };
  locations: string[];
  genders?: Gender[];
  occupations?: string[];
};

export type PsychographicTraits = {
  motivations: string[];
  barriers: string[];
  values: string[];
  lifestyleAttributes?: string[];
};

export type BehavioralPatterns = {
  purchaseTriggers: string[];
  trustChannels: string[];
  decisionStyle?: 'impulsive' | 'analytical' | 'social' | 'value-driven';
  brandLoyalty?: 'low' | 'medium' | 'high';
  priceAnchor?: number;
};

export type Segment = {
  id: string;
  name: string;
  description: string;
  demographicCriteria: DemographicCriteria;
  psychographicTraits: PsychographicTraits;
  behavioralPatterns: BehavioralPatterns;
  createdAt: string;
  updatedAt: string;
};

export type CreateSegmentInput = {
  name: string;
  description: string;
  demographicCriteria: DemographicCriteria;
  psychographicTraits: PsychographicTraits;
  behavioralPatterns: BehavioralPatterns;
};

export type UpdateSegmentInput = {
  name?: string;
  description?: string;
  demographicCriteria?: DemographicCriteria;
  psychographicTraits?: PsychographicTraits;
  behavioralPatterns?: BehavioralPatterns;
};

export type GeneratePersonasInput = {
  count: number;
  diversityLevel: 'low' | 'medium' | 'high';
};

export type GeneratePersonasResult = {
  segmentId: string;
  segmentName: string;
  generatedCount: number;
  personas: Persona[];
};

// ── Study ──────────────────────────────────────────────────

export type StudyStatus = 'draft' | 'active' | 'completed' | 'archived' | string;

export type Study = {
  id: string;
  name: string;
  objective: string;
  status: string;
  tags: string[] | null;
  createdAt: string;
};

export type CreateStudyInput = {
  name: string;
  objective: string;
  status?: string;
  tags?: string[];
};

export type UpdateStudyInput = {
  name?: string;
  objective?: string;
  status?: string;
  tags?: string[];
};
