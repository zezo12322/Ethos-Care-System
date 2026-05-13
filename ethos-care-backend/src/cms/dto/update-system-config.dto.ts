import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsOptional()
  label?: string;
}
