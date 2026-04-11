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
      totalOperations,
      totalLocations,
      totalUsers,
    ] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.count({
        where: {
          lifecycleStatus: {
            in: [
              'DRAFT',
              'REVIEW',
              'FIELD_VERIFICATION',
            ],
          },
        },
      }),
      this.prisma.family.count(),
      this.prisma.family.count({ where: { status: 'مستحق' } }),
      this.prisma.operation.count(),
      this.prisma.location.count(),
      this.prisma.user.count(),
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
      },
      public: {
        families: eligibleFamilies > 0 ? eligibleFamilies : totalFamilies,
        locations: totalLocations,
        volunteers: totalUsers,
      },
    };
  }
}
