import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FamilyMemberInputDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  age?: string;

  @IsString()
  @IsOptional()
  relation?: string;

  @IsString()
  @IsOptional()
  education?: string;
}

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  headName!: string;

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
  education?: string;

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberInputDto)
  membersDetails?: FamilyMemberInputDto[];

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
