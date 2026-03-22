import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchByNationalId(nationalId: string) {
    // 1. Search in Families
    const family = await this.prisma.family.findFirst({
      where: { nationalId: nationalId }
    });

    // 2. Search in Cases
    const cases = await this.prisma.case.findMany({
      where: { nationalId: nationalId }
    });

    if (!family && cases.length === 0) {
      return { found: false };
    }

    return {
      found: true,
      family: family ? {
        id: family.id,
        name: family.headName,
        status: family.status,
        income: family.income,
        membersCount: family.membersCount,
        address: family.address,
        lastVisit: family.lastVisit
      } : null,
      cases: cases.map(c => ({
        id: c.id,
        name: c.applicantName,
        type: c.caseType,
        status: c.status,
        date: c.createdAt,
      }))
    };
  }
}
