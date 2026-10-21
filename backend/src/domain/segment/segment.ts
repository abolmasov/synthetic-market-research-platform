// Demographic criteria for defining segment boundaries
export type DemographicCriteria = {
  ageRange: { min: number; max: number };
  incomeRange: { min: number; max: number }; // Annual income in thousands USD
  locations: string[];
  genders?: ('male' | 'female' | 'non-binary' | 'other')[];
  occupations?: string[];
};

// Psychographic traits defining the segment's mindset
export type PsychographicTraits = {
  motivations: string[];
  barriers: string[];
  values: string[];
  lifestyleAttributes?: string[];
};

// Behavioral patterns for the segment
export type BehavioralPatterns = {
  purchaseTriggers: string[];
  trustChannels: string[];
  decisionStyle?: 'impulsive' | 'analytical' | 'social' | 'value-driven';
  brandLoyalty?: 'low' | 'medium' | 'high';
  priceAnchor?: number;
};

export type SegmentProps = {
  id?: string;
  workspaceId?: string | null;
  name: string;
  description: string;
  demographicCriteria: DemographicCriteria;
  psychographicTraits: PsychographicTraits;
  behavioralPatterns: BehavioralPatterns;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Segment {
  constructor(private readonly props: SegmentProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get workspaceId(): string | null | undefined {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get demographicCriteria(): DemographicCriteria {
    return this.props.demographicCriteria;
  }

  get psychographicTraits(): PsychographicTraits {
    return this.props.psychographicTraits;
  }

  get behavioralPatterns(): BehavioralPatterns {
    return this.props.behavioralPatterns;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(
    input: Omit<SegmentProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Segment {
    return new Segment({ ...input });
  }

  static rehydrate(
    props: Required<Pick<SegmentProps, 'id' | 'createdAt'>> &
      Omit<SegmentProps, 'id' | 'createdAt'>,
  ): Segment {
    return new Segment(props);
  }
}
