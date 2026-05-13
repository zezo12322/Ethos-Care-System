import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDropdownOptionDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
