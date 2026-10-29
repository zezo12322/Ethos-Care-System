import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats() {
    return this.statsService.getDashboardStats();
  }

  // لوحة المدير اللحظية — تفاصيل تشغيلية لا تُعرض للعامة
  @Get('live')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  async getLive() {
    return this.statsService.getLiveStats();
  }

  // أرقام بنود الاستمارة (لحوم، سلات غذائية...) للمدير
  @Get('form')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  async getForm() {
    return this.statsService.getFormStats();
  }
}
