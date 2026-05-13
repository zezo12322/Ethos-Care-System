import { IsOptional, IsString, MaxLength } from 'class-validator';

export class TransitionCaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
