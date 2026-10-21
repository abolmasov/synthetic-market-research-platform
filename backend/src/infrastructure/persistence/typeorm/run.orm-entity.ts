import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'runs' })
export class RunOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  hypothesisId!: string;

  @Column({ type: 'uuid', nullable: true })
  panelId!: string | null;

  @Column({ type: 'text', array: true })
  variantIds!: string[];

  @Column({ length: 4 })
  stage!: string;

  @Column({ length: 40 })
  status!: string;

  @Column({ type: 'jsonb' })
  config!: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
