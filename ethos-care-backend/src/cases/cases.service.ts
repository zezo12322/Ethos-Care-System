import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.case.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.case.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.case.create({
      data: {
        applicantName: data.applicantName || "بدون اسم",
        nationalId: data.nationalId || null,
        caseType: data.caseType || "غير محدد",
        status: "قيد المراجعة",
        priority: data.priority || "عادي",
        location: data.address || data.location || "بني سويف",
        description: data.description || "",
        familyId: data.familyId || null,
      }
    });
  }
}

