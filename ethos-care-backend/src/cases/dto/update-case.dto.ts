import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseDto } from './create-case.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateCaseDto extends PartialType(CreateCaseDto) {
  @IsString()
  @IsOptional()
  lifecycleStatus?: string;

  @IsString()
  @IsOptional()
  completenessStatus?: string;

  @IsString()
  @IsOptional()
  decisionStatus?: string;
}
