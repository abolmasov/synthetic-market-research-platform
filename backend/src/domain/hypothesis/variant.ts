export type VariantStatus = 'draft' | 'shortlisted' | 'rejected' | 'tested';

export type VariantProps = {
  id?: string;
  hypothesisId: string;
  name: string;
  description?: string | null;
  pricePoint?: number | null;
  positioning?: string | null;
  claims?: string[] | null;
  changeSummary: string;
  content: string;
  version: number;
  status: VariantStatus;
  expectedUplift?: number | null;
  successMetric?: string | null;
  risk?: string | null;
  notes?: string | null;
  createdAt?: Date;
};

export class Variant {
  constructor(private readonly props: VariantProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get hypothesisId(): string {
    return this.props.hypothesisId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get pricePoint(): number | null | undefined {
    return this.props.pricePoint;
  }

  get positioning(): string | null | undefined {
    return this.props.positioning;
  }

  get claims(): string[] | null | undefined {
    return this.props.claims;
  }

  get changeSummary(): string {
    return this.props.changeSummary;
  }

  get content(): string {
    return this.props.content;
  }

  get version(): number {
    return this.props.version;
  }

  get status(): VariantStatus {
    return this.props.status;
  }

  get expectedUplift(): number | null | undefined {
    return this.props.expectedUplift;
  }

  get successMetric(): string | null | undefined {
    return this.props.successMetric;
  }

  get risk(): string | null | undefined {
    return this.props.risk;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  static create(input: Omit<VariantProps, 'id' | 'createdAt'>): Variant {
    return new Variant({ ...input });
  }

  static rehydrate(
    props: Required<Pick<VariantProps, 'id' | 'createdAt'>> &
      Omit<VariantProps, 'id' | 'createdAt'>,
  ): Variant {
    return new Variant(props);
  }
}
