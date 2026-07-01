import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/**
 * فلتر أخطاء موحّد: يحوّل أخطاء Prisma الشائعة إلى رموز HTTP ورسائل عربية
 * متسقة، ويمنع تسرّب تفاصيل أخطاء 500 الداخلية إلى العميل.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'حدث خطأ غير متوقع. حاول مرة أخرى لاحقًا.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ?? message);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'القيمة موجودة بالفعل — تكرار غير مسموح.';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'السجل المطلوب غير موجود.';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'مرجع غير صالح في البيانات المرسلة.';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'تعذّر تنفيذ العملية على قاعدة البيانات.';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'بيانات غير صالحة.';
    }

    // نسجّل تفاصيل أخطاء الخادم الداخلية فقط (لا نكشفها للعميل)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error
          ? `${exception.message}\n${exception.stack ?? ''}`
          : String(exception),
      );
    }

    response.status(status).json({ statusCode: status, message });
  }
}
