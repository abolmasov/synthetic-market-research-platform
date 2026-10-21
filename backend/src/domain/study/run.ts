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
};

export type RunProps = {
  id?: string;
  hypothesisId: string;
  panelId?: string | null;
  variantIds: string[];
  stage: RunStage;
  status: RunStatus;
  config: RunConfig;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt?: Date;
};

export class Run {
  constructor(private readonly props: RunProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get hypothesisId(): string {
    return this.props.hypothesisId;
  }

  get panelId(): string | null | undefined {
    return this.props.panelId;
  }

  get variantIds(): string[] {
    return this.props.variantIds;
  }

  get stage(): RunStage {
    return this.props.stage;
  }

  get status(): RunStatus {
    return this.props.status;
  }

  get config(): RunConfig {
    return this.props.config;
  }

  get startedAt(): Date | null | undefined {
    return this.props.startedAt;
  }

  get completedAt(): Date | null | undefined {
    return this.props.completedAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  static create(input: Omit<RunProps, 'id' | 'createdAt'>): Run {
    return new Run({ ...input });
  }

  static rehydrate(
    props: Required<Pick<RunProps, 'id' | 'createdAt'>> &
      Omit<RunProps, 'id' | 'createdAt'>,
  ): Run {
    return new Run(props);
  }
}
