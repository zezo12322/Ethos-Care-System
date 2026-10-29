import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      // ملخص الحالات لكل أسرة — الأسرة هي القائمة الرئيسية وفلاترها بالمرحلة/الأولوية
      include: {
        cases: {
          select: {
            id: true,
            caseType: true,
            lifecycleStatus: true,
            priority: true,
            lastActionAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const family = await this.prisma.family.findUnique({
      where: { id },
      include: {
        familyMembers: true,
        cases: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: { select: { id: true, name: true } },
            history: {
              orderBy: { performedAt: 'desc' },
              include: {
                performedBy: { select: { id: true, name: true, role: true } },
              },
            },
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }

  async create(data: CreateFamilyDto) {
    // منع تكرار الأسر بنفس الرقم القومي (الأسرة مصدر واحد لكل عائل)
    const nationalId = data.nationalId?.trim();
    if (nationalId) {
      const existing = await this.prisma.family.findUnique({
        where: { nationalId },
      });
      if (existing) {
        // نرجّع رقم الأسرة القائمة عشان الواجهة تفتح ملفها مباشرة
        throw new ConflictException({
          message:
            'يوجد بالفعل أسرة مسجّلة بنفس الرقم القومي. افتح ملف الأسرة القائم وأضف الحالة عليه بدلًا من إنشاء أسرة جديدة.',
          familyId: existing.id,
        });
      }
    }

    // الأسرة أولًا: ملف الأسرة يُنشأ وحده، والحالات تُضاف من داخله باستمارة الحالة الكاملة
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
        nationalId: nationalId || null,
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
