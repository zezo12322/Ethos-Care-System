import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export const VOLUNTEER_STATUSES = [
  'PENDING',
  'ACTIVE',
  'INACTIVE',
  'REJECTED',
] as const;

export class CreateVolunteerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(100)
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  preferredArea?: string;

  @IsString()
  @IsOptional()
  skills?: string;

  @IsString()
  @IsOptional()
  @IsIn(VOLUNTEER_STATUSES)
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
