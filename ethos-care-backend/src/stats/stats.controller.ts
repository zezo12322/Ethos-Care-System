import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // إحصاءات لوحة التحكم الكاملة — للمستخدمين المصادَق عليهم فقط
  @Get()
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.statsService.getDashboardStats();
  }

  // أرقام عامة آمنة للصفحة الرئيسية (بدون مصادقة)
  @Get('public')
  async getPublicStats() {
    return this.statsService.getPublicStats();
  }
}
