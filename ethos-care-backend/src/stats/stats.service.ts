import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Run all aggregations concurrently for performance
    const [
      totalCases,
      pendingCases,
      totalFamilies,
      eligibleFamilies,
      totalOperations
    ] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.count({ where: { status: 'قيد المراجعة' } }),
      this.prisma.family.count(),
      this.prisma.family.count({ where: { status: 'مستحق' } }),
      this.prisma.operation.count()
    ]);

    return {
      cases: {
        total: totalCases,
        pending: pendingCases,
      },
      families: {
        total: totalFamilies,
        eligible: eligibleFamilies,
      },
      operations: {
        total: totalOperations,
        totalBudget: 0,
      }
    };
  }
}
