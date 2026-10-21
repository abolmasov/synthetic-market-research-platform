import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// Sub-DTOs for nested objects
export class PersonalityProfileDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  openness!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  conscientiousness!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  extraversion!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  agreeableness!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  neuroticism!: number;
}

export class HealthProfileDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  insomniaSeverity!: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  anxietyLevel!: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  chronicPain!: number;

  @IsArray()
  @IsString({ each: true })
  currentSupplements!: string[];
}

export class CognitiveProfileDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  lossAversion!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  authorityBias!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  socialProof!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  statusQuoBias!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  anchoring!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  confirmationBias!: number;
}

export class DecisionStyleDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  system1Weight!: number;

  @IsNumber()
  @Min(0)
  priceAnchor!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  riskTolerance!: number;
}

export class CreatePersonaDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  segment!: string;

  @IsOptional()
  @IsUUID()
  segmentId?: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  motivations!: string[];

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  barriers!: string[];

  @IsString()
  @IsNotEmpty()
  trustChannel!: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  purchaseTriggers!: string[];

  @IsString()
  @IsNotEmpty()
  budgetRange!: string;

  @IsOptional()
  @IsString()
  contextNotes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(13)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  income?: number;

  // Extended demographics
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'non-binary', 'other'])
  gender?: 'male' | 'female' | 'non-binary' | 'other';

  @IsOptional()
  @IsString()
  occupation?: string;

  // OCEAN personality profile
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PersonalityProfileDto)
  personality?: PersonalityProfileDto;

  // Health profile
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HealthProfileDto)
  healthProfile?: HealthProfileDto;

  // Cognitive biases
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CognitiveProfileDto)
  cognitiveProfile?: CognitiveProfileDto;

  // Decision-making style
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DecisionStyleDto)
  decisionStyle?: DecisionStyleDto;
}
