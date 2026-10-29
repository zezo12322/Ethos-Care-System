import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestAidDto } from './dto/request-aid.dto';
import { ContactMessageDto } from './dto/contact-message.dto';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequestAid(data: RequestAidDto) {
    const nationalId = data.nationalId?.trim() || null;
    const existing = nationalId
      ? await this.prisma.family.findUnique({ where: { nationalId } })
      : null;
    const caseData = {
      applicantName: data.applicantName,
      nationalId,
      caseType: data.aidType,
      priority: 'NORMAL',
      location: data.village ? `${data.village} - ${data.city}` : data.city,
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

    if (existing) {
      const requestCase = await this.prisma.case.create({
        data: { ...caseData, familyId: existing.id },
      });
      return this.toRequestAidResponse(requestCase);
    }

    const family = await this.prisma.family.create({
      data: {
        headName: data.applicantName,
        nationalId,
        phone: data.phone,
        city: data.city,
        village: data.village || null,
        addressDetails: data.addressDetails || null,
        address: data.village ? `${data.village} - ${data.city}` : data.city,
        status: 'تحت التقييم',
        socialStatus: 'غير محدد',
        lastVisit: new Date(),
        cases: { create: caseData },
      },
      include: {
        cases: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return this.toRequestAidResponse(family.cases[0]);
  }

  private toRequestAidResponse(requestCase: {
    id: string;
    lifecycleStatus: string;
  }) {
    return {
      requestId: requestCase.id.slice(0, 8).toUpperCase(),
      fullRequestId: requestCase.id,
      lifecycleStatus: requestCase.lifecycleStatus,
      message: 'تم تسجيل طلبك بنجاح وسيتم مراجعته من فريق الجمعية',
    };
  }

  async verifyRequest(requestId: string) {
    const normalizedId = requestId.trim().toLowerCase();
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
      phone: requestCase.family?.phone || null,
    };
  }

  async verifyMember(nationalId: string) {
    const family = await this.prisma.family.findFirst({
      where: { nationalId: nationalId.trim() },
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
      phone: family.phone,
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

  private async appendSubmission(fileName: string, payload: unknown) {
    // على الاستضافات serverless القرص للقراءة فقط: SUBMISSIONS_DIR=/tmp
    const storageDir =
      process.env.SUBMISSIONS_DIR ?? join(process.cwd(), 'storage');
    await mkdir(storageDir, { recursive: true });

    const record = JSON.stringify({
      ...((payload as Record<string, unknown>) || {}),
      submittedAt: new Date().toISOString(),
    });

    await appendFile(join(storageDir, fileName), `${record}\n`, 'utf8');
  }
}
