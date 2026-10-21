import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class AgeRangeDto {
  @IsNumber()
  @Min(0)
  min!: number;

  @IsNumber()
  @Min(0)
  max!: number;
}

export class IncomeRangeDto {
  @IsNumber()
  @Min(0)
  min!: number;

  @IsNumber()
  @Min(0)
  max!: number;
}

export class DemographicCriteriaDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AgeRangeDto)
  ageRange!: AgeRangeDto;

  @IsObject()
  @ValidateNested()
  @Type(() => IncomeRangeDto)
  incomeRange!: IncomeRangeDto;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  locations!: string[];

  @IsOptional()
  @IsArray()
  @IsIn(['male', 'female', 'non-binary', 'other'], { each: true })
  genders?: ('male' | 'female' | 'non-binary' | 'other')[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  occupations?: string[];
}

export class PsychographicTraitsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  motivations!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  barriers!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lifestyleAttributes?: string[];
}

export class BehavioralPatternsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  purchaseTriggers!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  trustChannels!: string[];

  @IsOptional()
  @IsString()
  @IsIn(['impulsive', 'analytical', 'social', 'value-driven'])
  decisionStyle?: 'impulsive' | 'analytical' | 'social' | 'value-driven';

  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  brandLoyalty?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAnchor?: number;
}

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DemographicCriteriaDto)
  demographicCriteria!: DemographicCriteriaDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PsychographicTraitsDto)
  psychographicTraits!: PsychographicTraitsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => BehavioralPatternsDto)
  behavioralPatterns!: BehavioralPatternsDto;
}
