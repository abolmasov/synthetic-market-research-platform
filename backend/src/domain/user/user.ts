import { randomUUID } from 'crypto';

export type UserRole = 'admin' | 'analyst' | 'viewer';

export type UserProps = {
  id: string;
  workspaceId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  get id() {
    return this.props.id;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get name() {
    return this.props.name;
  }
  get role() {
    return this.props.role;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  static create(
    input: Omit<UserProps, 'id' | 'createdAt' | 'workspaceId'> & {
      workspaceId?: string;
    },
  ): User {
    return new User({
      ...input,
      id: randomUUID(),
      workspaceId: input.workspaceId || randomUUID(),
      createdAt: new Date(),
    });
  }

  static rehydrate(props: UserProps): User {
    return new User(props);
  }
}
