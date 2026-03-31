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
    // Initial status defaults are mapped based on inputs
    const lifecycleStatus = 'DRAFT';
    const completenessStatus = createCaseDto.nationalId
      ? 'COMPLETE'
      : 'MISSING_NATIONAL_ID';
    const decisionStatus = 'PENDING_DECISION';

    const newCase = await this.prisma.case.create({
      data: {
        ...this.buildCreatePayload(createCaseDto),
        lifecycleStatus,
        completenessStatus,
        decisionStatus,
      },
    });

    // Record history
    await this.prisma.caseHistory.create({
      data: {
        caseId: newCase.id,
        toLifecycleStatus: lifecycleStatus,
        toDecisionStatus: decisionStatus,
        action: 'CREATED',
      },
    });

    return newCase;
  }

  async getUrgentQueue() {
    return this.prisma.case.findMany({
      where: {
        priority: 'URGENT',
        lifecycleStatus: { notIn: ['COMPLETED', 'REJECTED', 'ARCHIVED'] },
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
          in: ['INTAKE_REVIEW', 'FIELD_VERIFICATION', 'COMMITTEE_REVIEW'],
        },
      },
      include: { family: true },
    });
  }

  async getAwaitingExecutionQueue() {
    return this.prisma.case.findMany({
      where: {
        decisionStatus: 'APPROVED',
        lifecycleStatus: 'APPROVED',
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
    return this.prisma.case.update({
      where: { id },
      data: this.buildUpdatePayload(updateCaseDto),
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

    // Update case
    const updatedCase = await this.prisma.case.update({
      where: { id },
      data: {
        lifecycleStatus: toLifecycle,
        decisionStatus: toDecision,
        lastActionAt: new Date(),
      },
    });

    // Record transition history
    await this.prisma.caseHistory.create({
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
    });

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
