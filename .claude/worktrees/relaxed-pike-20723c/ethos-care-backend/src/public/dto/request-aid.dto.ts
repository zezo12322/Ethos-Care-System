import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RequestAidDto {
  @IsString()
  @MinLength(3)
  applicantName!: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @MinLength(7)
  phone!: string;

  @IsString()
  @MinLength(2)
  city!: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @MinLength(2)
  aidType!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsString()
  @IsOptional()
  addressDetails?: string;
}
