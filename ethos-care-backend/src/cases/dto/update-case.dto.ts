import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseDto } from './create-case.dto';

/**
 * تعديل بيانات الحالة (المحتوى فقط). حقول دورة الحياة (lifecycleStatus /
 * decisionStatus / completenessStatus) لا تُقبل هنا عمدًا — تغيير المرحلة
 * يتم حصريًا عبر مسارات transitions التي تتحقق من التسلسل وتكتب سجل التاريخ.
 * ValidationPipe (whitelist + forbidNonWhitelisted) يرفض أي محاولة لإرسالها.
 */
export class UpdateCaseDto extends PartialType(CreateCaseDto) {}
