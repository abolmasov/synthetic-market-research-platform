import { IsNotEmpty, IsString } from 'class-validator';

export class RagQueryDto {
  @IsString()
  @IsNotEmpty()
  hypothesis!: string;
}
