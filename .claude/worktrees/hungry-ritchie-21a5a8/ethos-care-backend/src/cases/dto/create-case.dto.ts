import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export const CASE_PRIORITIES = ['NORMAL', 'HIGH', 'URGENT'] as const;

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  applicantName!: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsNotEmpty()
  caseType!: string;

  @IsString()
  @IsOptional()
  @IsIn(CASE_PRIORITIES)
  priority?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  formData?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  familyId?: string;
}
