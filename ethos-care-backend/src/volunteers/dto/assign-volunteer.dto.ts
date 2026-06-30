import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignVolunteerDto {
  @IsString()
  @IsNotEmpty()
  operationId!: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  attended?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  hours?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAssignmentDto {
  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  attended?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  hours?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
