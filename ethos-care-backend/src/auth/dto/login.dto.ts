import { IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsString()
  password?: string;
}
