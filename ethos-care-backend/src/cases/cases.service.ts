import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** المراحل المسموح الانتقال منها لكل إجراء (حماية تسلسل دورة حياة الحالة) */
const TRANSITION_SOURCES: Record<string, string[]> = {
  review: ['DRAFT'],
  field_verify: ['REVIEW'],
  approve: ['FIELD_VERIFICATION'],
  execute: ['APPROVED'],
  complete: ['EXECUTION'],
  return_to_draft: ['REVIEW', 'FIELD_VERIFICATION', 'APPROVED', 'EXECUTION'],
};
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

/** بيانات رب الأسرة كما تصل من استمارة الحالة (formData.person) */
interface CaseFormPerson {
  fullName?: string;
  nationalId?: string;
  mobile?: string;
  job?: string;
  monthlyIncome?: string;
  center?: string;
  village?: string;
  educationState?: string;
  detailedAddress?: string;
}

/** بيانات فرد الأسرة كما تصل من الاستمارة (formData.family.members) */
interface CaseFormMember {
  name?: string;
  relation?: string;
  age?: string;
  education?: string;
  nationalId?: string;
  gender?: string;
  mobile?: string;
  job?: string;
  monthlyIncome?: string;
  classification?: string;
  educationType?: string;
  educationStage?: string;
  schoolYear?: string;
}

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

  /** استخراج بيانات رب الأسرة وأفرادها من formData الخاص بالاستمارة */
  private extractFamilyForm(formData?: Record<string, unknown>) {
    const fd = (formData ?? {}) as {
      person?: CaseFormPerson;
      family?: { members?: CaseFormMember[] };
    };
    const person = fd.person ?? {};
    // members === null تعني أن الاستمارة لم ترسل قسم الأسرة إطلاقًا (لا نمسح الأفراد)
    const members =
      fd.family && Array.isArray(fd.family.members) ? fd.family.members : null;
    return { person, members };
  }

  private toMemberData(
    member: CaseFormMember,
  ): Omit<Prisma.FamilyMemberCreateManyInput, 'familyId'> {
    return {
      name: (member.name ?? '').trim() || 'بدون اسم',
      relation: member.relation || 'ابن/ة',
      age: member.age || null,
      education: member.education || null,
      nationalId: member.nationalId || null,
      gender: member.gender || null,
      mobile: member.mobile || null,
      job: member.job || null,
      monthlyIncome: member.monthlyIncome ? String(member.monthlyIncome) : null,
      classification: member.classification || null,
      educationType: member.educationType || null,
      educationStage: member.educationStage || null,
      schoolYear: member.schoolYear || null,
    };
  }

  /**
   * يضمن ربط كل حالة بأسرة:
   *  1) ربط صريح بـ familyId إن وُجد،
   *  2) وإلا البحث بالرقم القومي (منع التكرار)،
   *  3) وإلا إنشاء أسرة جديدة من بيانات رب الأسرة.
   */
  private async resolveFamilyId(
    tx: Prisma.TransactionClient,
    params: {
      applicantName?: string;
      nationalId?: string;
      explicitFamilyId?: string;
    },
    person: CaseFormPerson,
    members: CaseFormMember[] | null,
  ): Promise<string> {
    const explicitId = params.explicitFamilyId?.trim();
    const nationalId =
      (params.nationalId ?? person.nationalId ?? '').trim() || null;

    if (explicitId) {
      const existing = await tx.family.findUnique({
        where: { id: explicitId },
      });
      if (existing) {
        await this.syncFamily(tx, existing.id, person, members);
        return existing.id;
      }
    }

    if (nationalId) {
      const byNationalId = await tx.family.findUnique({
        where: { nationalId },
      });
      if (byNationalId) {
        await this.syncFamily(tx, byNationalId.id, person, members);
        return byNationalId.id;
      }
    }

    const validMembers = (members ?? []).filter((m) => (m.name ?? '').trim());
    const created = await tx.family.create({
      data: {
        headName:
          (params.applicantName ?? person.fullName ?? '').trim() || 'بدون اسم',
        nationalId,
        phone: person.mobile || null,
        job: person.job || null,
        income: person.monthlyIncome ? String(person.monthlyIncome) : null,
        city: person.center || undefined,
        village: person.village || null,
        education: person.educationState || null,
        addressDetails: person.detailedAddress || null,
        address: person.detailedAddress || null,
        lastVisit: new Date(),
        membersCount: validMembers.length + 1,
        familyMembers: validMembers.length
          ? { create: validMembers.map((m) => this.toMemberData(m)) }
          : undefined,
      },
    });
    return created.id;
  }

  /**
   * تحديث ملف الأسرة من بيانات الاستمارة (الأسرة هي المصدر الوحيد للأفراد).
   * لا نمسح قيم رأس الأسرة الموجودة بقيم فارغة، ونستبدل الأفراد فقط عند
   * إرسال قسم الأسرة في الاستمارة.
   */
  private async syncFamily(
    tx: Prisma.TransactionClient,
    familyId: string,
    person: CaseFormPerson,
    members: CaseFormMember[] | null,
  ): Promise<void> {
    const headData: Prisma.FamilyUpdateInput = { lastVisit: new Date() };
    const setIfPresent = (key: string, value?: string | null) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        (headData as Record<string, unknown>)[key] = value;
      }
    };
    setIfPresent('phone', person.mobile);
    setIfPresent('job', person.job);
    setIfPresent(
      'income',
      person.monthlyIncome ? String(person.monthlyIncome) : undefined,
    );
    setIfPresent('city', person.center);
    setIfPresent('village', person.village);
    setIfPresent('education', person.educationState);
    setIfPresent('addressDetails', person.detailedAddress);

    if (members !== null) {
      const validMembers = members.filter((m) => (m.name ?? '').trim());
      // لا نمسح أفراد الأسرة إلا عند إرسال أفراد فعليين — حتى لا تُمسح القائمة
      // بالخطأ عند حفظ حالة بلقطة قديمة فارغة من الأفراد.
      if (validMembers.length) {
        await tx.familyMember.deleteMany({ where: { familyId } });
        await tx.familyMember.createMany({
          data: validMembers.map((m) => ({
            ...this.toMemberData(m),
            familyId,
          })),
        });
        headData.membersCount = validMembers.length + 1;
      }
    }

    await tx.family.update({ where: { id: familyId }, data: headData });
  }

  async create(createCaseDto: CreateCaseDto) {
    const lifecycleStatus = 'DRAFT';
    const completenessStatus = createCaseDto.nationalId
      ? 'COMPLETE'
      : 'MISSING_NATIONAL_ID';
    const decisionStatus = 'PENDING_DECISION';
    const { person, members } = this.extractFamilyForm(createCaseDto.formData);

    // Atomic transaction — create case + record history together
    return this.prisma.$transaction(async (tx) => {
      // كل حالة لازم تكون مرتبطة بأسرة (ربط صريح / بحث بالرقم القومي / إنشاء تلقائي)
      const familyId = await this.resolveFamilyId(
        tx,
        {
          applicantName: createCaseDto.applicantName,
          nationalId: createCaseDto.nationalId,
          explicitFamilyId: createCaseDto.familyId,
        },
        person,
        members,
      );

      const newCase = await tx.case.create({
        data: {
          ...this.buildCreatePayload(createCaseDto),
          familyId,
          lifecycleStatus,
          completenessStatus,
          decisionStatus,
        },
      });

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
      const query = filters.search.trim();
      where.OR = [
        { applicantName: { contains: query, mode: 'insensitive' } },
        { nationalId: { contains: query, mode: 'insensitive' } },
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
        assignedTo: { select: { id: true, name: true, role: true } },
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

    const { person, members } = this.extractFamilyForm(updateCaseDto.formData);

    return this.prisma.$transaction(async (tx) => {
      // تحديد الأسرة الهدف: ربط صريح جديد، وإلا الأسرة الحالية، وإلا بحث/إنشاء
      let targetFamilyId: string | null = currentCase.familyId ?? null;
      if (updateCaseDto.familyId !== undefined) {
        targetFamilyId = updateCaseDto.familyId.trim() || null;
      }

      if (targetFamilyId) {
        const existing = await tx.family.findUnique({
          where: { id: targetFamilyId },
        });
        if (existing) {
          await this.syncFamily(tx, existing.id, person, members);
        } else {
          targetFamilyId = null;
        }
      }

      if (!targetFamilyId) {
        // لا توجد أسرة بعد — نضمن الربط بالبحث بالرقم القومي أو الإنشاء التلقائي
        targetFamilyId = await this.resolveFamilyId(
          tx,
          {
            applicantName: updateCaseDto.applicantName,
            nationalId: updateCaseDto.nationalId,
            explicitFamilyId: undefined,
          },
          person,
          members,
        );
      }

      // إعادة حساب حالة استيفاء الملف عند تغيّر الرقم القومي
      const recomputedCompleteness =
        updateCaseDto.nationalId !== undefined
          ? updateCaseDto.nationalId.trim()
            ? 'COMPLETE'
            : 'MISSING_NATIONAL_ID'
          : undefined;

      const updatedCase = await tx.case.update({
        where: { id },
        data: {
          ...this.buildUpdatePayload(updateCaseDto),
          familyId: targetFamilyId,
          ...(recomputedCompleteness
            ? { completenessStatus: recomputedCompleteness }
            : {}),
        },
      });

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

    // التحقق من صحة الانتقال بحسب المرحلة الحالية
    const allowedFrom = TRANSITION_SOURCES[action];
    if (allowedFrom && !allowedFrom.includes(currentCase.lifecycleStatus)) {
      throw new BadRequestException(
        'لا يمكن تنفيذ هذا الإجراء من المرحلة الحالية للحالة.',
      );
    }

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
