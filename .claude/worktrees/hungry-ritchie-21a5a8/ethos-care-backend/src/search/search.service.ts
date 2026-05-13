import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchAll(query: string) {
    if (!query || query.trim() === '') {
      return { cases: [], families: [] };
    }

    const searchQuery = query.trim();

    const cases = await this.prisma.case.findMany({
      where: {
        OR: [
          { applicantName: { contains: searchQuery, mode: 'insensitive' } },
          { nationalId: { contains: searchQuery, mode: 'insensitive' } },
          { id: { contains: searchQuery, mode: 'insensitive' } },
          { caseType: { contains: searchQuery, mode: 'insensitive' } },
          { location: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    const families = await this.prisma.family.findMany({
      where: {
        OR: [
          { headName: { contains: searchQuery, mode: 'insensitive' } },
          { nationalId: { contains: searchQuery, mode: 'insensitive' } },
          { phone: { contains: searchQuery, mode: 'insensitive' } },
          { id: { contains: searchQuery, mode: 'insensitive' } },
          { address: { contains: searchQuery, mode: 'insensitive' } },
          { city: { contains: searchQuery, mode: 'insensitive' } },
          { village: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return { cases, families };
  }
}
