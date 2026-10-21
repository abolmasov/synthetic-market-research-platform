import {
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { RunStage, RunStatus } from '../../../domain/study/run';

export class UpdateRunDto {
  @IsOptional()
  @IsString()
  hypothesisId?: string;

  @IsOptional()
  @IsString()
  panelId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variantIds?: string[];

  @IsOptional()
  @IsEnum(['H1', 'H2', 'H3'])
  stage?: RunStage;

  @IsOptional()
  @IsEnum(['queued', 'running', 'completed', 'failed'])
  status?: RunStatus;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
