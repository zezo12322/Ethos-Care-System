import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  applicantName: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsNotEmpty()
  caseType: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  familyId?: string;
}
