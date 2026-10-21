import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  BehavioralPatterns,
  DemographicCriteria,
  PsychographicTraits,
} from '../../../domain/segment/segment';

@Entity({ name: 'segments' })
export class SegmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb' })
  demographicCriteria!: DemographicCriteria;

  @Column({ type: 'jsonb' })
  psychographicTraits!: PsychographicTraits;

  @Column({ type: 'jsonb' })
  behavioralPatterns!: BehavioralPatterns;

  @Column({ type: 'uuid', name: 'workspace_id', nullable: true })
  workspaceId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
