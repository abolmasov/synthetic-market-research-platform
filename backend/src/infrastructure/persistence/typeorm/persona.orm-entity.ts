import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type {
  CognitiveProfile,
  DecisionStyle,
  Gender,
  HealthProfile,
  PersonalityProfile,
} from '../../../domain/persona/persona';

@Entity({ name: 'personas' })
export class PersonaOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 120 })
  segment!: string;

  @Column({ type: 'uuid', nullable: true })
  segmentId!: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  motivations!: string[] | null;

  @Column({ type: 'text', array: true, nullable: true })
  barriers!: string[] | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  trustChannel!: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  purchaseTriggers!: string[] | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  budgetRange!: string | null;

  @Column({ type: 'text', nullable: true })
  contextNotes!: string | null;

  @Column({ type: 'int', nullable: true })
  age!: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  location!: string | null;

  @Column({ type: 'int', nullable: true })
  income!: number | null;

  // Extended demographics
  @Column({ type: 'varchar', length: 20, nullable: true })
  gender!: Gender | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  occupation!: string | null;

  // OCEAN personality profile (stored as JSON)
  @Column({ type: 'jsonb', nullable: true })
  personality!: PersonalityProfile | null;

  // Health profile (stored as JSON)
  @Column({ type: 'jsonb', nullable: true })
  healthProfile!: HealthProfile | null;

  // Cognitive biases (stored as JSON)
  @Column({ type: 'jsonb', nullable: true })
  cognitiveProfile!: CognitiveProfile | null;

  // Decision-making style (stored as JSON)
  @Column({ type: 'jsonb', nullable: true })
  decisionStyle!: DecisionStyle | null;

  @Column({ type: 'uuid', name: 'workspace_id', nullable: true })
  workspaceId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
