import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOperationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  operationTitle?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  operationType?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  target?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  targetFamilies?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  volunteers?: number;

  @IsString()
  @IsOptional()
  executionDate?: string;
}
