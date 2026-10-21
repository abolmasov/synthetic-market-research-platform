import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import type {
  ArtifactStage,
  ArtifactType,
} from '../../../domain/study/artifact';

export class CreateArtifactDto {
  @IsString()
  @IsNotEmpty()
  runId!: string;

  @IsEnum(['H1', 'H2', 'H3'])
  stage!: ArtifactStage;

  @IsEnum([
    'quotes',
    'objections',
    'drivers',
    'segment_metrics',
    'variant_ranking',
    'risk_flags',
    'evidence_summary',
  ])
  type!: ArtifactType;

  @IsObject()
  payload!: Record<string, unknown>;
}
