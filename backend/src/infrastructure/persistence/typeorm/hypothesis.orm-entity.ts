import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'hypotheses' })
export class HypothesisOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  studyId!: string | null;

  @Column({ length: 4 })
  stage!: string;

  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text' })
  statement!: string;

  @Column({ length: 40 })
  status!: string;

  @Column({
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  successCriteria!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  protocolId!: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  primaryMetric!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  primaryMetricDirection!: string | null;

  @Column({ type: 'double precision', nullable: true })
  primaryMetricThreshold!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  guardrails!: Record<string, unknown>[] | null;

  @Column({ type: 'text', nullable: true })
  falsificationRule!: string | null;

  @Column({ type: 'int', nullable: true })
  sampleSize!: number | null;

  @Column({ type: 'int', nullable: true })
  testDurationDays!: number | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  decisionOutcome!: string;

  @Column({ type: 'text', nullable: true })
  decisionReason!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastEvaluatedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'uuid', name: 'workspace_id', nullable: true })
  workspaceId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
