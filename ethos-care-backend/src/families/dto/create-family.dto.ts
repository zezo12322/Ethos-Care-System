import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  headName: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  membersCount?: number;

  @IsString()
  @IsOptional()
  income?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  socialStatus?: string;

  @IsString()
  @IsOptional()
  job?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  addressDetails?: string;

  @IsOptional()
  membersDetails?: any;

  @IsString()
  @IsOptional()
  status?: string;
  @IsString()
  @IsOptional()
  caseType?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  description?: string;

}
