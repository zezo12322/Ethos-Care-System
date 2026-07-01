import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  newPassword?: string;
}
