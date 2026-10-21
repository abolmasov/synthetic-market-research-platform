import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { RunStage, RunStatus } from '../../../domain/study/run';

export class CreateRunDto {
  @IsString()
  @IsNotEmpty()
  hypothesisId!: string;

  @IsOptional()
  @IsString()
  panelId?: string;

  @IsArray()
  @IsString({ each: true })
  variantIds!: string[];

  @IsEnum(['H1', 'H2', 'H3'])
  stage!: RunStage;

  @IsEnum(['queued', 'running', 'completed', 'failed'])
  status!: RunStatus;

  @IsObject()
  config!: Record<string, any>;
}
