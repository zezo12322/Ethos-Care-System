import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOperationDto } from './dto/create-operation.dto';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    filters: { status?: string; search?: string; type?: string } = {},
  ) {
    const where: NonNullable<
      Parameters<typeof this.prisma.operation.findMany>[0]
    >['where'] = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      const query = filters.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
        { id: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.operation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const operation = await this.prisma.operation.findUnique({
      where: { id },
      include: { cases: true },
    });

    if (!operation) {
      throw new NotFoundException('Operation not found');
    }

    return operation;
  }

  async create(data: CreateOperationDto) {
    return this.prisma.operation.create({
      data: {
        name: data.operationTitle || data.name || 'بدون اسم',
        type: data.operationType || data.type || 'غير محدد',
        target: data.targetFamilies || data.target || 0,
        achieved: 0,
        progress: 0,
        volunteers: data.volunteers || 0,
        date: data.executionDate ? new Date(data.executionDate) : new Date(),
        status: 'تجهيز',
      },
    });
  }

  async assignCases(operationId: string, caseIds: string[]) {
    const operation = await this.prisma.operation.findUnique({
      where: { id: operationId },
    });
    if (!operation) throw new NotFoundException('Operation not found');

    // Update the cases to link them to the operation
    await this.prisma.case.updateMany({
      where: { id: { in: caseIds } },
      data: { operationId },
    });

    // Update operation progress
    const updatedCount = await this.prisma.case.count({
      where: { operationId },
    });
    const progress = Math.min(
      100,
      Math.round((updatedCount / (operation.target || 1)) * 100),
    );

    return this.prisma.operation.update({
      where: { id: operationId },
      data: { achieved: updatedCount, progress, status: 'جاري' },
      include: { cases: true },
    });
  }

  async completeOperation(operationId: string) {
    const operation = await this.prisma.operation.findUnique({
      where: { id: operationId },
      include: { cases: true },
    });

    if (!operation) throw new NotFoundException('Operation not found');

    // لا نُكمل إلا الحالات الموجودة فعليًا في مرحلة التنفيذ (احترام آلة الحالات
    // وعدم تزوير سجل التاريخ لحالات في مراحل أخرى)
    const executable = (operation.cases ?? []).filter(
      (c) => c.lifecycleStatus === 'EXECUTION',
    );

    // كل ذلك داخل transaction واحدة حتى لا يبقى النظام في حالة جزئية
    return this.prisma.$transaction(async (tx) => {
      if (executable.length > 0) {
        const caseIds = executable.map((c) => c.id);
        await tx.case.updateMany({
          where: { id: { in: caseIds } },
          data: { lifecycleStatus: 'COMPLETED', lastActionAt: new Date() },
        });

        await tx.caseHistory.createMany({
          data: executable.map((c) => ({
            caseId: c.id,
            fromLifecycleStatus: c.lifecycleStatus,
            toLifecycleStatus: 'COMPLETED',
            fromDecisionStatus: c.decisionStatus,
            toDecisionStatus: c.decisionStatus,
            action: 'complete',
            reason: `تم التنفيذ عن طريق حملة: ${operation.name}`,
          })),
        });
      }

      return tx.operation.update({
        where: { id: operationId },
        data: { status: 'مكتمل', progress: 100 },
      });
    });
  }
}
