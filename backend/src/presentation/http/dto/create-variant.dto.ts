import {
  ArrayNotEmpty,
  IsIn,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

const VARIANT_STATUSES = [
  'draft',
  'shortlisted',
  'rejected',
  'tested',
] as const;

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePoint?: number;

  @IsOptional()
  @IsString()
  positioning?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  claims?: string[];

  @IsString()
  @IsNotEmpty()
  changeSummary!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsIn(VARIANT_STATUSES)
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  expectedUplift?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  successMetric?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  risk?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
