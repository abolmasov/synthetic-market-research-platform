import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'hypothesis_variants' })
export class VariantOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  hypothesisId!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'double precision', nullable: true })
  pricePoint!: number | null;

  @Column({ type: 'text', nullable: true })
  positioning!: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  claims!: string[] | null;

  @Column({ type: 'text' })
  changeSummary!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'int' })
  version!: number;

  @Column({ length: 40 })
  status!: string;

  @Column({ type: 'double precision', nullable: true })
  expectedUplift!: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  successMetric!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  risk!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
