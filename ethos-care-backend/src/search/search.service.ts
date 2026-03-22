import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchAll(query: string) {
    if (!query || query.trim() === '') {
      return { cases: [], families: [] };
    }

    const cases = await this.prisma.case.findMany({
      where: {
        OR: [
          { applicantName: { contains: query } },
          { nationalId: { contains: query } },
          { id: { contains: query } },
        ]
      },
      take: 20
    });

    const families = await this.prisma.family.findMany({
      where: {
        OR: [
          { headName: { contains: query } },
          { nationalId: { contains: query } },
          { phone: { contains: query } },
          { id: { contains: query } },
        ]
      },
      take: 20
    });

    return { cases, families };
  }
}
