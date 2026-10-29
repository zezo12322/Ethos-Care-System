import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  /** تاريخ نشر الخبر — يسمح بتسجيل خبر بتاريخ سابق. افتراضيًا وقت الإنشاء. */
  @IsDateString()
  @IsOptional()
  date?: string;
}
