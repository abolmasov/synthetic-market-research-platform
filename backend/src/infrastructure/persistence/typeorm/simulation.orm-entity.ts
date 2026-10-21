import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'simulations' })
export class SimulationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  hypothesis!: string;

  @Column({ type: 'uuid', nullable: true })
  hypothesisId!: string | null;

  @Column({ length: 32 })
  status!: string;

  @Column({ type: 'jsonb' })
  summary!: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  decisions!: Record<string, unknown>[];

  @Column({ type: 'jsonb' })
  ragSources!: Record<string, unknown>[];

  @Column({ type: 'jsonb' })
  topSignals!: string[];

  @Column({ type: 'jsonb' })
  objections!: string[];

  @Column({ type: 'uuid', name: 'workspace_id', nullable: true })
  workspaceId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}
