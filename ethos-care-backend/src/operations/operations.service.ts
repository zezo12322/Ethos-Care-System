import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.operation.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.operation.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.operation.create({
      data: {
        name: data.operationTitle || data.name || "بدون اسم",
        type: data.operationType || data.type || "غير محدد",
        target: parseInt(data.targetFamilies || data.target) || 0,
        achieved: 0,
        progress: 0,
        volunteers: parseInt(data.volunteers) || 0,
        date: data.executionDate ? new Date(data.executionDate) : new Date(),
        status: "تجهيز",
      }
    });
  }
}
