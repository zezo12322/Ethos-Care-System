import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { status?: string; search?: string } = {}) {
    const where: NonNullable<
      Parameters<typeof this.prisma.family.findMany>[0]
    >['where'] = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const query = filters.search.trim();
      where.OR = [
        { headName: { contains: query, mode: 'insensitive' } },
        { nationalId: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { village: { contains: query, mode: 'insensitive' } },
        { id: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.family.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const family = await this.prisma.family.findUnique({
      where: { id },
      include: {
        familyMembers: true,
        cases: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }

  async create(data: CreateFamilyDto) {
    const lifecycleStatus = 'DRAFT';
    const decisionStatus = 'PENDING_DECISION';
    const completenessStatus = data.nationalId
      ? 'COMPLETE'
      : 'MISSING_NATIONAL_ID';

    const familyMembersData =
      data.membersDetails && data.membersDetails.length > 0
        ? {
            create: data.membersDetails.map((member) => ({
              name: member.name,
              age: member.age,
              relation: member.relation || 'ابن/ة',
              education: member.education || 'لا يدرس',
            })),
          }
        : undefined;

    return this.prisma.family.create({
      data: {
        headName: data.headName || 'بدون اسم',
        familyMembers: familyMembersData,
        membersCount: data.membersCount || 1,
        income: data.income ? String(data.income) : '0',
        address: data.address || 'غير محدد',
        phone: data.phone || 'غير محدد',
        lastVisit: new Date(),
        status: 'تحت التقييم',
        socialStatus: data.socialStatus || 'متزوج/ة',
        job: data.job || null,
        education: data.education || null,
        city: data.city || 'بني سويف - المركز',
        village: data.village || null,
        addressDetails: data.addressDetails || null,
        nationalId: data.nationalId || null,
        cases: {
          create: {
            applicantName: data.headName || 'بدون اسم',
            nationalId: data.nationalId || null,
            caseType: data.caseType || 'تمكين اقتصادي',
            priority: data.priority || 'NORMAL',
            location: data.village
              ? `${data.village} - ${data.city}`
              : 'بني سويف',
            description: data.description || null,
            lifecycleStatus,
            decisionStatus,
            completenessStatus,
            history: {
              create: {
                toLifecycleStatus: lifecycleStatus,
                toDecisionStatus: decisionStatus,
                action: 'CREATED_WITH_FAMILY',
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateFamilyDto) {
    return this.prisma.family.update({
      where: { id },
      data: {
        headName: data.headName,
        membersCount: data.membersCount || 1,
        income: data.income ? String(data.income) : '0',
        address: data.address,
        phone: data.phone,
        status: data.status,
        socialStatus: data.socialStatus,
        job: data.job,
        education: data.education,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.family.delete({
      where: { id },
    });
  }
}
