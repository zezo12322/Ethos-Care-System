import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestAidDto } from './dto/request-aid.dto';
import { ContactMessageDto } from './dto/contact-message.dto';
import { VolunteerApplicationDto } from './dto/volunteer-application.dto';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';

/** إخفاء وسط رقم الهاتف قبل إرجاعه من نقطة نهاية عامة */
function maskPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\s+/g, '');
  if (digits.length < 5) return '***';
  return `${digits.slice(0, 3)}****${digits.slice(-2)}`;
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequestAid(data: RequestAidDto) {
    const nationalId = data.nationalId?.trim() || null;
    const location = data.village ? `${data.village} - ${data.city}` : data.city;

    // بيانات الحالة الجديدة (مشتركة بين مسار الأسرة القائمة والأسرة الجديدة)
    const caseData: Prisma.CaseCreateWithoutFamilyInput = {
      applicantName: data.applicantName,
      nationalId,
      caseType: data.aidType,
      priority: 'NORMAL',
      location,
      description: data.description,
      lifecycleStatus: 'DRAFT',
      completenessStatus: nationalId ? 'COMPLETE' : 'MISSING_NATIONAL_ID',
      decisionStatus: 'PENDING_DECISION',
      history: {
        create: {
          toLifecycleStatus: 'DRAFT',
          toDecisionStatus: 'PENDING_DECISION',
          action: 'CREATED_PUBLIC_REQUEST',
        },
      },
    };

    try {
      const requestCase = await this.prisma.$transaction(async (tx) => {
        // ربط الطلب بأسرة قائمة بنفس الرقم القومي إن وُجدت (لا ننشئ أسرة مكررة)
        const existing = nationalId
          ? await tx.family.findUnique({ where: { nationalId } })
          : null;

        if (existing) {
          await tx.family.update({
            where: { id: existing.id },
            data: { lastVisit: new Date() },
          });
          return tx.case.create({
            data: { ...caseData, family: { connect: { id: existing.id } } },
          });
        }

        const family = await tx.family.create({
          data: {
            headName: data.applicantName,
            nationalId,
            phone: data.phone,
            city: data.city,
            village: data.village || null,
            addressDetails: data.addressDetails || null,
            address: location,
            status: 'تحت التقييم',
            socialStatus: 'غير محدد',
            lastVisit: new Date(),
            cases: { create: caseData },
          },
          include: { cases: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        return family.cases[0];
      });

      return {
        requestId: requestCase.id.slice(0, 8).toUpperCase(),
        fullRequestId: requestCase.id,
        lifecycleStatus: requestCase.lifecycleStatus,
        message: 'تم تسجيل طلبك بنجاح وسيتم مراجعته من فريق الجمعية',
      };
    } catch (error) {
      // خط دفاع أخير ضد سباق التكرار على الرقم القومي الفريد للأسرة
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'يوجد طلب مسجّل بالفعل بنفس الرقم القومي. سيتواصل معك فريق الجمعية.',
        );
      }
      throw error;
    }
  }

  async verifyRequest(requestId: string) {
    const normalizedId = requestId.trim().toLowerCase();

    // الرقم المرجعي المعروض للمستخدم 8 محارف — نمنع البحث ببادئات قصيرة
    // (تعداد) بفرض حد أدنى للطول.
    if (normalizedId.length < 8) {
      throw new NotFoundException('لم يتم العثور على الطلب');
    }

    const requestCase = await this.prisma.case.findFirst({
      where: {
        OR: [{ id: normalizedId }, { id: { startsWith: normalizedId } }],
      },
      include: {
        family: {
          select: {
            headName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!requestCase) {
      throw new NotFoundException('لم يتم العثور على الطلب');
    }

    return {
      id: requestCase.id.slice(0, 8).toUpperCase(),
      applicantName: requestCase.applicantName,
      caseType: requestCase.caseType,
      lifecycleStatus: requestCase.lifecycleStatus,
      decisionStatus: requestCase.decisionStatus,
      createdAt: requestCase.createdAt,
      phone: maskPhone(requestCase.family?.phone),
    };
  }

  async verifyMember(nationalId: string) {
    const normalized = nationalId.trim();

    // نتطلّب رقمًا قوميًا كاملًا (14 رقمًا) — نمنع البحث بأجزاء والتعداد
    if (!/^\d{14}$/.test(normalized)) {
      throw new NotFoundException('لم يتم العثور على بيانات مطابقة');
    }

    const family = await this.prisma.family.findFirst({
      where: { nationalId: normalized },
      include: {
        cases: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!family) {
      throw new NotFoundException('لم يتم العثور على بيانات مطابقة');
    }

    return {
      headName: family.headName,
      nationalId: family.nationalId,
      status: family.status,
      city: family.city,
      phone: maskPhone(family.phone),
      recentCases: family.cases.map((requestCase) => ({
        id: requestCase.id.slice(0, 8).toUpperCase(),
        caseType: requestCase.caseType,
        lifecycleStatus: requestCase.lifecycleStatus,
      })),
    };
  }

  async saveContactMessage(data: ContactMessageDto) {
    await this.appendSubmission('contact-messages.jsonl', data);
    return {
      message: 'تم استلام رسالتك بنجاح وسيتم التواصل معك قريبًا',
      submittedAt: new Date().toISOString(),
    };
  }

  async saveVolunteerApplication(data: VolunteerApplicationDto) {
    const nationalId = data.nationalId?.trim() || null;
    const phone = data.phone?.trim() || null;

    // منع التكرار: لو فيه متطوّع بنفس الرقم القومي أو الهاتف، لا ننشئ سجلًا جديدًا
    const duplicateConditions = [
      ...(nationalId ? [{ nationalId }] : []),
      ...(phone ? [{ phone }] : []),
    ];
    const existing = duplicateConditions.length
      ? await this.prisma.volunteer.findFirst({
          where: { OR: duplicateConditions },
        })
      : null;

    if (!existing) {
      // نسجّل طلب التطوع في قاعدة البيانات كمتطوّع "قيد المراجعة" ليظهر للإدارة
      await this.prisma.volunteer.create({
        data: {
          name: data.name,
          phone,
          nationalId,
          birthDate: data.birthDate || null,
          education: data.education || null,
          schoolYear: data.schoolYear || null,
          center: data.center || null,
          whatsapp: data.whatsapp || null,
          email: data.email || null,
          address: data.address || null,
          preferredArea: data.preferredArea || null,
          notes: data.notes || null,
          status: 'PENDING',
          source: 'PUBLIC_FORM',
        },
      });
    }

    // نحتفظ دائمًا بنسخة في الملف كنسخة احتياطية
    await this.appendSubmission('volunteer-applications.jsonl', data);

    return {
      message: existing
        ? 'طلبك مسجّل لدينا بالفعل وسيتم التواصل معك. شكرًا لاهتمامك بالتطوع.'
        : 'تم استلام طلب التطوع وسيتم مراجعته من فريق الجمعية',
      submittedAt: new Date().toISOString(),
    };
  }

  private async appendSubmission(fileName: string, payload: unknown) {
    const storageDir = join(process.cwd(), 'storage');
    await mkdir(storageDir, { recursive: true });

    const record = JSON.stringify({
      ...((payload as Record<string, unknown>) || {}),
      submittedAt: new Date().toISOString(),
    });

    await appendFile(join(storageDir, fileName), `${record}\n`, 'utf8');
  }
}
