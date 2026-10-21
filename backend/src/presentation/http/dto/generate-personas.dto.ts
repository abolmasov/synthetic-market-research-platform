import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';

export class GeneratePersonasDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  count!: number;

  @IsIn(['low', 'medium', 'high'])
  diversityLevel!: 'low' | 'medium' | 'high';
}
