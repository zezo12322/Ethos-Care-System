import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export const APP_ROLES = [
  'ADMIN',
  'CEO',
  'MANAGER',
  'CASE_WORKER',
  'DATA_ENTRY',
  'EXECUTION_OFFICER',
] as const;

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsIn(APP_ROLES)
  role!: (typeof APP_ROLES)[number];
}
