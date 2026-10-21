export type StudyStatus = 'draft' | 'active' | 'completed' | 'archived';

export type StudyProps = {
  id?: string;
  workspaceId?: string | null;
  name: string;
  objective: string;
  status: StudyStatus;
  tags?: string[] | null;
  createdAt?: Date;
};

export class Study {
  constructor(private readonly props: StudyProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get workspaceId(): string | null | undefined {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get objective(): string {
    return this.props.objective;
  }

  get status(): StudyStatus {
    return this.props.status;
  }

  get tags(): string[] | null | undefined {
    return this.props.tags;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  static create(input: Omit<StudyProps, 'id' | 'createdAt'>): Study {
    return new Study({ ...input });
  }

  static rehydrate(
    props: Required<Pick<StudyProps, 'id' | 'createdAt'>> &
      Omit<StudyProps, 'id' | 'createdAt'>,
  ): Study {
    return new Study(props);
  }
}
