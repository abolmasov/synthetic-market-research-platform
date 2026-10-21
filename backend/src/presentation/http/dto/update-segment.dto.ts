import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  BehavioralPatternsDto,
  DemographicCriteriaDto,
  PsychographicTraitsDto,
} from './create-segment.dto';

export class UpdateSegmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DemographicCriteriaDto)
  demographicCriteria?: DemographicCriteriaDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PsychographicTraitsDto)
  psychographicTraits?: PsychographicTraitsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BehavioralPatternsDto)
  behavioralPatterns?: BehavioralPatternsDto;
}
