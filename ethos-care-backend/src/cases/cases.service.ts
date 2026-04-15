import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  private buildCreatePayload(
    payload: CreateCaseDto,
  ): Prisma.CaseUncheckedCreateInput {
    const { formData, ...rest } = payload;

    return {
      ...rest,
      ...(formData !== undefined
        ? { formData: formData as Prisma.InputJsonValue }
        : {}),
    };
  }

  private buildUpdatePayload(
    payload: UpdateCaseDto,
  ): Prisma.CaseUncheckedUpdateInput {
    const { formData, ...rest } = payload;

    return {
      ...rest,
      ...(formData !== undefined
        ? { formData: formData as Prisma.InputJsonValue }
        : {}),
    };
  }

  async create(createCaseDto: CreateCaseDto) {
    const lifecycleStatus = 'DRAFT';
    const completenessStatus = createCaseDto.nationalId
      ? 'COMPLETE'
      : 'MISSING_NATIONAL_ID';
    const decisionStatus = 'PENDING_DECISION';
    const familyId = createCaseDto.familyId?.trim() || undefined;

    // Atomic transaction — create case + record history together
    return this.prisma.$transaction(async (tx) => {
      const newCase = await tx.case.create({
        data: {
          ...this.buildCreatePayload(createCaseDto),
          familyId,
          lifecycleStatus,
          completenessStatus,
          decisionStatus,
        },
      });

      if (familyId) {
        await tx.family.update({
          where: { id: familyId },
          data: { lastVisit: new Date() },
        });
      }

      await tx.caseHistory.create({
        data: {
          caseId: newCase.id,
          toLifecycleStatus: lifecycleStatus,
          toDecisionStatus: decisionStatus,
          action: 'CREATED',
        },
      });

      return newCase;
    });
  }

  async getUrgentQueue() {
    return this.prisma.case.findMany({
      where: {
        priority: 'URGENT',
        lifecycleStatus: { notIn: ['COMPLETED'] },
      },
      include: { family: true },
    });
  }

  async getMissingNationalIdQueue() {
    return this.prisma.case.findMany({
      where: { completenessStatus: 'MISSING_NATIONAL_ID' },
      include: { family: true },
    });
  }

  async getUnderReviewQueue() {
    return this.prisma.case.findMany({
      where: {
        lifecycleStatus: {
          in: ['REVIEW', 'FIELD_VERIFICATION'],
        },
      },
      include: { family: true },
    });
  }

  async getAwaitingExecutionQueue() {
    return this.prisma.case.findMany({
      where: {
        lifecycleStatus: { in: ['APPROVED', 'EXECUTION'] },
      },
      include: { family: true },
    });
  }

  findAll(filters: { status?: string; type?: string; search?: string }) {
    const where: Prisma.CaseWhereInput = {};
    if (filters.status) where.lifecycleStatus = filters.status;
    if (filters.type) where.caseType = filters.type;
    if (filters.search) {
      where.OR = [
        { applicantName: { contains: filters.search } },
        { nationalId: { contains: filters.search } },
      ];
    }
    return this.prisma.case.findMany({ where, include: { family: true } });
  }

  async findOne(id: string) {
    const foundCase = await this.prisma.case.findUnique({
      where: { id },
      include: {
        family: {
          include: {
            cases: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        history: true,
        operation: true,
        assignedTo: true,
      },
    });
    if (!foundCase) throw new NotFoundException('Case not found');
    return foundCase;
  }

  async update(id: string, updateCaseDto: UpdateCaseDto) {
    const currentCase = await this.prisma.case.findUnique({
      where: { id },
      select: { familyId: true },
    });

    if (!currentCase) {
      throw new NotFoundException('Case not found');
    }

    const nextFamilyId = updateCaseDto.familyId?.trim() || undefined;

    return this.prisma.$transaction(async (tx) => {
      const updatedCase = await tx.case.update({
        where: { id },
        data: {
          ...this.buildUpdatePayload(updateCaseDto),
          ...(updateCaseDto.familyId !== undefined
            ? { familyId: nextFamilyId }
            : {}),
        },
      });

      if (nextFamilyId && nextFamilyId !== currentCase.familyId) {
        await tx.family.update({
          where: { id: nextFamilyId },
          data: { lastVisit: new Date() },
        });
      }

      return updatedCase;
    });
  }

  async remove(id: string) {
    return this.prisma.case.delete({ where: { id } });
  }

  async transition(
    id: string,
    toLifecycle: string,
    toDecision: string,
    action: string,
    reason?: string,
    performedById?: string,
  ) {
    const currentCase = await this.findOne(id);

    // Atomic transaction — update case + record history together
    const [updatedCase] = await this.prisma.$transaction([
      this.prisma.case.update({
        where: { id },
        data: {
          lifecycleStatus: toLifecycle,
          decisionStatus: toDecision,
          lastActionAt: new Date(),
        },
      }),
      this.prisma.caseHistory.create({
        data: {
          caseId: id,
          fromLifecycleStatus: currentCase.lifecycleStatus,
          toLifecycleStatus: toLifecycle,
          fromDecisionStatus: currentCase.decisionStatus,
          toDecisionStatus: toDecision,
          action,
          reason,
          performedById,
        },
      }),
    ]);

    return updatedCase;
  }

  async getHistory(id: string) {
    return this.prisma.caseHistory.findMany({
      where: { caseId: id },
      orderBy: { performedAt: 'desc' },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }
}
