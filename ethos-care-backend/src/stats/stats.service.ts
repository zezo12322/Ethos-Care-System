import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CacheEntry<T> {
  data: T;
  expires: number;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  // الإحصاءات لا تحتاج تحديثًا لحظيًا — نخزّنها مؤقتًا لتقليل الضغط على القاعدة
  private readonly TTL_MS = 60_000;
  private dashboardCache: CacheEntry<unknown> | null = null;
  private publicCache: CacheEntry<unknown> | null = null;

  /** أرقام عامة آمنة فقط (للصفحة الرئيسية) — بلا عدّادات داخلية أو عدد المستخدمين */
  async getPublicStats() {
    if (this.publicCache && this.publicCache.expires > Date.now()) {
      return this.publicCache.data;
    }
    const [totalFamilies, eligibleFamilies, totalLocations, activeVolunteers] =
      await Promise.all([
        this.prisma.family.count(),
        this.prisma.family.count({ where: { status: 'مستحق' } }),
        this.prisma.location.count(),
        this.prisma.volunteer.count({ where: { status: 'ACTIVE' } }),
      ]);
    const data = {
      families: eligibleFamilies > 0 ? eligibleFamilies : totalFamilies,
      locations: totalLocations,
      volunteers: activeVolunteers,
    };
    this.publicCache = { data, expires: Date.now() + this.TTL_MS };
    return data;
  }

  async getDashboardStats() {
    if (this.dashboardCache && this.dashboardCache.expires > Date.now()) {
      return this.dashboardCache.data;
    }
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

    const data = {
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
    this.dashboardCache = { data, expires: Date.now() + this.TTL_MS };
    return data;
  }
}
