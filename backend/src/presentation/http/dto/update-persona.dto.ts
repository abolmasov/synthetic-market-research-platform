import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CognitiveProfileDto,
  DecisionStyleDto,
  HealthProfileDto,
  PersonalityProfileDto,
} from './create-persona.dto';

export class UpdatePersonaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  segment?: string;

  @IsOptional()
  @IsUUID()
  segmentId?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  motivations?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  barriers?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  trustChannel?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  purchaseTriggers?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  contextNotes?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(13)
  @Max(120)
  age?: number | null;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  income?: number | null;

  // Extended demographics
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'non-binary', 'other'])
  gender?: 'male' | 'female' | 'non-binary' | 'other' | null;

  @IsOptional()
  @IsString()
  occupation?: string | null;

  // OCEAN personality profile
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PersonalityProfileDto)
  personality?: PersonalityProfileDto | null;

  // Health profile
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HealthProfileDto)
  healthProfile?: HealthProfileDto | null;

  // Cognitive biases
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CognitiveProfileDto)
  cognitiveProfile?: CognitiveProfileDto | null;

  // Decision-making style
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DecisionStyleDto)
  decisionStyle?: DecisionStyleDto | null;
}
