import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const HYPOTHESIS_STATUSES = [
  'draft',
  'ready',
  'running',
  'completed',
  'canceled',
  'active',
  'archived',
] as const;
const HYPOTHESIS_STAGES = ['H1', 'H2', 'H3'] as const;
const HYPOTHESIS_METRICS = [
  'acceptanceRate',
  'rejectionRate',
  'maybeRate',
  'averageConfidence',
  'priceAnchorHitRate',
] as const;
const VERIFICATION_DIRECTIONS = ['at_least', 'at_most'] as const;
const VERIFICATION_DECISIONS = ['pending', 'pass', 'iterate', 'kill'] as const;

export class HypothesisGuardrailDto {
  @IsIn(HYPOTHESIS_METRICS)
  metric!: string;

  @IsIn(VERIFICATION_DIRECTIONS)
  direction!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold!: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;
}

export class CreateHypothesisDto {
  @IsOptional()
  @IsUUID()
  studyId?: string;

  @IsOptional()
  @IsIn(HYPOTHESIS_STAGES)
  stage?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @IsString()
  @IsNotEmpty()
  statement!: string;

  @IsOptional()
  @IsIn(HYPOTHESIS_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  successCriteria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  protocolId?: string;

  @IsOptional()
  @IsIn(HYPOTHESIS_METRICS)
  primaryMetric?: string;

  @IsOptional()
  @IsIn(VERIFICATION_DIRECTIONS)
  primaryMetricDirection?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  primaryMetricThreshold?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HypothesisGuardrailDto)
  guardrails?: HypothesisGuardrailDto[];

  @IsOptional()
  @IsString()
  falsificationRule?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sampleSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  testDurationDays?: number;

  @IsOptional()
  @IsIn(VERIFICATION_DECISIONS)
  decisionOutcome?: string;

  @IsOptional()
  @IsString()
  decisionReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
