import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RunSimulationDto {
  @IsString()
  @IsNotEmpty()
  hypothesis!: string;

  @IsOptional()
  @IsUUID()
  hypothesisId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  personaIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  maxIterations?: number;
}
