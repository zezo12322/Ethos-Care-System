import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('Prisma');

  constructor() {
    // نسجّل التحذيرات والأخطاء (يظهر في سجلّات Azure) لتشخيص المشاكل
    super({ log: ['warn', 'error'] });
  }

  async onModuleInit() {
    // إعادة محاولة الاتصال حتى لا ينهار إقلاع التطبيق لو كانت قاعدة البيانات
    // غير متاحة مؤقتًا (مثلاً أثناء استئناف Azure PostgreSQL من الإيقاف).
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Connected to the database');
        return;
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Database connection attempt ${attempt}/${maxAttempts} failed: ${reason}`,
        );
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      }
    }
    // لا نرمي الخطأ: نترك الخدمة تبدأ (Prisma يتصل كسولًا عند أول استعلام)
    // بدلاً من انهيار الإقلاع بالكامل — /health سيعكس حالة الاتصال.
    this.logger.error(
      'Could not connect to the database after retries; starting anyway.',
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
