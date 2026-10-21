export type ArtifactStage = 'H1' | 'H2' | 'H3';
export type ArtifactType =
  | 'quotes'
  | 'objections'
  | 'drivers'
  | 'segment_metrics'
  | 'variant_ranking'
  | 'risk_flags'
  | 'evidence_summary';

export type ArtifactProps = {
  id?: string;
  runId: string;
  stage: ArtifactStage;
  type: ArtifactType;
  payload: Record<string, unknown>;
  createdAt?: Date;
};

export class Artifact {
  constructor(private readonly props: ArtifactProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get runId(): string {
    return this.props.runId;
  }

  get stage(): ArtifactStage {
    return this.props.stage;
  }

  get type(): ArtifactType {
    return this.props.type;
  }

  get payload(): Record<string, unknown> {
    return this.props.payload;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  static create(input: Omit<ArtifactProps, 'id' | 'createdAt'>): Artifact {
    return new Artifact({ ...input });
  }

  static rehydrate(
    props: Required<Pick<ArtifactProps, 'id' | 'createdAt'>> &
      Omit<ArtifactProps, 'id' | 'createdAt'>,
  ): Artifact {
    return new Artifact(props);
  }
}
