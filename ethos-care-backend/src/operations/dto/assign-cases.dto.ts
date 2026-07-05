import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignCasesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  caseIds!: string[];
}
