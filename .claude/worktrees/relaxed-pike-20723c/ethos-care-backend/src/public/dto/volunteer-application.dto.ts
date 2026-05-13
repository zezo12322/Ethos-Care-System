import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VolunteerApplicationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(7)
  phone!: string;

  @Type(() => Number)
  @IsInt()
  @Min(16)
  @Max(90)
  @IsOptional()
  age?: number;

  @IsString()
  @MinLength(2)
  preferredArea!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
