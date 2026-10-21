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

export type PersonaProps = {
  id?: string;
  name: string;
  segment: string;
  segmentId?: string | null; // Optional reference to Segment entity
  motivations: string[];
  barriers: string[];
  trustChannel: string;
  purchaseTriggers: string[];
  budgetRange: string;
  contextNotes?: string | null;
  age?: number | null;
  location?: string | null;
  income?: number | null;
  createdAt?: Date;

  // Extended demographics
  gender?: Gender | null;
  occupation?: string | null;

  // OCEAN personality profile
  personality?: PersonalityProfile | null;

  // Health profile
  healthProfile?: HealthProfile | null;

  // Cognitive biases
  cognitiveProfile?: CognitiveProfile | null;

  // Decision-making style
  decisionStyle?: DecisionStyle | null;

  // Workspace isolation
  workspaceId?: string | null;
};

export class Persona {
  constructor(private readonly props: PersonaProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get segment(): string {
    return this.props.segment;
  }

  get segmentId(): string | null | undefined {
    return this.props.segmentId;
  }

  get motivations(): string[] {
    return this.props.motivations;
  }

  get barriers(): string[] {
    return this.props.barriers;
  }

  get trustChannel(): string {
    return this.props.trustChannel;
  }

  get purchaseTriggers(): string[] {
    return this.props.purchaseTriggers;
  }

  get budgetRange(): string {
    return this.props.budgetRange;
  }

  get contextNotes(): string | null | undefined {
    return this.props.contextNotes;
  }

  get age(): number | null | undefined {
    return this.props.age;
  }

  get location(): string | null | undefined {
    return this.props.location;
  }

  get income(): number | null | undefined {
    return this.props.income;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get gender(): Gender | null | undefined {
    return this.props.gender;
  }

  get occupation(): string | null | undefined {
    return this.props.occupation;
  }

  get personality(): PersonalityProfile | null | undefined {
    return this.props.personality;
  }

  get healthProfile(): HealthProfile | null | undefined {
    return this.props.healthProfile;
  }

  get cognitiveProfile(): CognitiveProfile | null | undefined {
    return this.props.cognitiveProfile;
  }

  get decisionStyle(): DecisionStyle | null | undefined {
    return this.props.decisionStyle;
  }

  get workspaceId(): string | null | undefined {
    return this.props.workspaceId;
  }

  static create(input: Omit<PersonaProps, 'id' | 'createdAt'>): Persona {
    return new Persona({ ...input });
  }

  static rehydrate(
    props: Required<Pick<PersonaProps, 'id' | 'createdAt'>> &
      Omit<PersonaProps, 'id' | 'createdAt'>,
  ): Persona {
    return new Persona(props);
  }
}
