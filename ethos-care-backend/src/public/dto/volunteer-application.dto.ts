import { IsOptional, IsString, MinLength } from 'class-validator';

export class VolunteerApplicationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(7)
  phone!: string;

  @IsString()
  @MinLength(2)
  preferredArea!: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  schoolYear?: string;

  @IsString()
  @IsOptional()
  center?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
