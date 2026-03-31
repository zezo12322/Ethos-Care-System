import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
