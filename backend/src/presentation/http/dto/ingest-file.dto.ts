import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IngestFileDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  sourceType!: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  industry?: string;
}
