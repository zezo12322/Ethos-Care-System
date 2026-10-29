import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { opinionOf } from '../cases/cases.service';
import { aggregateFormStats } from './form-stats';

const CLOSED_LIFECYCLES = ['COMPLETED', 'REJECTED', 'TECH_REJECTED'];
const STALE_DAYS = 7;
const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2 };
const VOLUNTEERS_KEY = 'stats_volunteers';

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
      totalLocations,
      volunteersContent,
    ] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.count({
        where: {
          lifecycleStatus: {
            in: ['DRAFT', 'REVIEW', 'FIELD_VERIFICATION'],
          },
        },
      }),
      this.prisma.family.count(),
      this.prisma.family.count({ where: { status: 'مستحق' } }),
      this.prisma.location.count(),
      this.prisma.siteContent.findUnique({ where: { key: VOLUNTEERS_KEY } }),
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
      public: {
        families: eligibleFamilies > 0 ? eligibleFamilies : totalFamilies,
        locations: totalLocations,
        // عدد المتطوعين رقم يدخله المدير من CMS (محتوى الموقع)
        volunteers: Number.parseInt(volunteersContent?.value ?? '', 10) || 0,
      },
    };
  }

  async getLiveStats() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const trendStart = new Date(startOfDay);
    trendStart.setDate(trendStart.getDate() - 13);
    const staleBefore = new Date(now.getTime() - STALE_DAYS * 86_400_000);
    const openWhere = { lifecycleStatus: { notIn: CLOSED_LIFECYCLES } };

    const [
      byLifecycle,
      openByPriority,
      staleOpen,
      casesToday,
      actionsToday,
      familiesToday,
      workload,
      recentActivity,
      trendCases,
      awaiting,
    ] = await Promise.all([
      this.prisma.case.groupBy({ by: ['lifecycleStatus'], _count: true }),
      this.prisma.case.groupBy({
        by: ['priority'],
        where: openWhere,
        _count: true,
      }),
      this.prisma.case.count({
        where: { ...openWhere, lastActionAt: { lt: staleBefore } },
      }),
      this.prisma.case.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.caseHistory.count({
        where: { performedAt: { gte: startOfDay } },
      }),
      this.prisma.family.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.case.groupBy({
        by: ['assignedToId'],
        where: openWhere,
        _count: true,
      }),
      this.prisma.caseHistory.findMany({
        orderBy: { performedAt: 'desc' },
        take: 12,
        select: {
          id: true,
          action: true,
          toLifecycleStatus: true,
          performedAt: true,
          case: { select: { id: true, applicantName: true } },
          performedBy: { select: { name: true } },
        },
      }),
      this.prisma.case.findMany({
        where: { createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      // حالات رفعها الباحث (موافقة/رفض) بانتظار اعتماد المدير
      this.prisma.case.findMany({
        where: { lifecycleStatus: { in: ['REVIEW', 'FIELD_VERIFICATION'] } },
        orderBy: { lastActionAt: 'asc' },
        take: 50,
        select: {
          id: true,
          applicantName: true,
          caseType: true,
          priority: true,
          familyId: true,
          lastActionAt: true,
          formData: true,
        },
      }),
    ]);

    const userIds = workload
      .map((w) => w.assignedToId)
      .filter((id): id is string => Boolean(id));
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true },
        })
      : [];
    const nameOf = new Map(users.map((u) => [u.id, u.name]));

    // ponytail: التجميع اليومي بتوقيت الخادم؛ لو الخادم UTC يظهر فرق ساعتين مع مصر قرب منتصف الليل
    const trend = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(trendStart);
      d.setDate(d.getDate() + i);
      // تاريخ محلي (مش UTC) عشان آخر خانة تبقى النهارده
      return { date: d.toLocaleDateString('en-CA'), count: 0 };
    });
    for (const c of trendCases) {
      const idx = Math.floor(
        (c.createdAt.getTime() - trendStart.getTime()) / 86_400_000,
      );
      if (trend[idx]) trend[idx].count++;
    }

    const countBy = (rows: { _count: number }[], key: string) =>
      Object.fromEntries(
        rows.map((r) => [
          String((r as Record<string, unknown>)[key]),
          r._count,
        ]),
      ) as Record<string, number>;

    return {
      generatedAt: now.toISOString(),
      staleDays: STALE_DAYS,
      today: {
        cases: casesToday,
        actions: actionsToday,
        families: familiesToday,
      },
      cases: {
        byLifecycle: countBy(byLifecycle, 'lifecycleStatus'),
        openByPriority: countBy(openByPriority, 'priority'),
        stale: staleOpen,
      },
      workload: workload
        .map((w) => ({
          userId: w.assignedToId,
          name: w.assignedToId
            ? (nameOf.get(w.assignedToId) ?? 'مستخدم محذوف')
            : 'غير مُسندة',
          open: w._count,
        }))
        .sort((a, b) => b.open - a.open),
      recentActivity,
      trend,
      awaitingDecision: awaiting
        .map(({ formData, ...c }) => ({
          ...c,
          opinion: opinionOf(formData) ?? null,
        }))
        .sort(
          (a, b) =>
            (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2),
        ),
    };
  }

  // ponytail: يقرأ استمارات كل الحالات في كل طلب؛ لو الحالات بالآلاف نحسبها دوريًا أو بـ SQL على JSON
  async getFormStats() {
    const cases = await this.prisma.case.findMany({
      select: { caseType: true, lifecycleStatus: true, formData: true },
    });
    return {
      generatedAt: new Date().toISOString(),
      ...aggregateFormStats(cases),
    };
  }
}
