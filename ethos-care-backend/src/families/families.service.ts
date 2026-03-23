import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.family.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.family.findUnique({ 
      where: { id },
      include: {
        familyMembers: true,
        cases: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async create(data: any) {
    const lifecycleStatus = 'DRAFT';
    const decisionStatus = 'PENDING_DECISION';
    const completenessStatus = data.nationalId ? 'COMPLETE' : 'MISSING_NATIONAL_ID';

    const familyMembersData = data.membersDetails && data.membersDetails.length > 0 
      ? {
          create: data.membersDetails.map((member: any) => ({
            name: member.name,
            age: member.age,
            relation: member.relation,
            education: member.education
          }))
        }
      : undefined;

    return this.prisma.family.create({
      data: {
        headName: data.headName || "بدون اسم",
        familyMembers: familyMembersData,
        membersCount: parseInt(data.membersCount) || 1,
        income: data.income ? String(data.income) : "0",
        address: data.address || "غير محدد",
        phone: data.phone || "غير محدد",
        lastVisit: new Date(),
        status: "تحت التقييم",
        socialStatus: data.socialStatus || "متزوج/ة",
        job: data.job || null,
        city: data.city || "بني سويف - المركز",
        village: data.village || null,
        addressDetails: data.addressDetails || null,
        nationalId: data.nationalId || null,
        cases: {
          create: {
            applicantName: data.headName || "بدون اسم",
            nationalId: data.nationalId || null,
            caseType: data.caseType || "تمكين اقتصادي",
            priority: data.priority || "عادي",
            location: data.village ? `${data.village} - ${data.city}` : "بني سويف",
            description: data.description || null,
            lifecycleStatus,
            decisionStatus,
            completenessStatus,
            history: {
              create: {
                toLifecycleStatus: lifecycleStatus,
                toDecisionStatus: decisionStatus,
                action: 'CREATED_WITH_FAMILY'
              }
            }
          }
        }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.family.update({
      where: { id },
      data: {
        headName: data.headName,
        membersCount: parseInt(data.membersCount) || 1,
        income: data.income ? String(data.income) : "0",
        address: data.address,
        phone: data.phone,
        status: data.status,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.family.delete({
      where: { id }
    });
  }
}
