import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateContentDto } from './dto/update-content.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateDropdownOptionDto } from './dto/create-dropdown-option.dto';
import { UpdateDropdownOptionDto } from './dto/update-dropdown-option.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { CreateServiceTypeDto } from '../services/dto/create-service-type.dto';
import { UpdateServiceTypeDto } from '../services/dto/update-service-type.dto';
import { CreateDocumentTypeDto } from '../document-types/dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from '../document-types/dto/update-document-type.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  Public aggregated endpoint
  // ──────────────────────────────────────────────────────────────────────────

  async getPublicData() {
    const [rawContent, campaigns, programs, documentTypes, serviceTypes] =
      await Promise.all([
        this.prisma.siteContent.findMany(),
        this.prisma.campaign.findMany({
          where: { active: true },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        }),
        this.prisma.program.findMany({
          where: { active: true },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        }),
        this.prisma.documentType.findMany({
          where: { active: true },
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        }),
        this.prisma.serviceType.findMany({
          where: { active: true },
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        }),
      ]);

    const content: Record<string, string> = {};
    for (const item of rawContent) {
      content[item.key] = item.value;
    }

    return { content, campaigns, programs, documentTypes, serviceTypes };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Site Content
  // ──────────────────────────────────────────────────────────────────────────

  findAllContent() {
    return this.prisma.siteContent.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  updateContent(key: string, data: UpdateContentDto) {
    return this.prisma.siteContent.upsert({
      where: { key },
      update: {
        value: data.value,
        ...(data.label !== undefined ? { label: data.label } : {}),
        ...(data.group !== undefined ? { group: data.group } : {}),
      },
      create: { key, value: data.value, label: data.label, group: data.group },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Campaigns
  // ──────────────────────────────────────────────────────────────────────────

  findAllCampaigns(adminView = false) {
    const where = adminView ? {} : { active: true };
    return this.prisma.campaign.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createCampaign(data: CreateCampaignDto) {
    return this.prisma.campaign.create({ data });
  }

  async updateCampaign(id: string, data: UpdateCampaignDto) {
    await this.requireCampaign(id);
    return this.prisma.campaign.update({ where: { id }, data });
  }

  async removeCampaign(id: string) {
    await this.requireCampaign(id);
    return this.prisma.campaign.delete({ where: { id } });
  }

  private async requireCampaign(id: string) {
    const item = await this.prisma.campaign.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الحملة غير موجودة');
    return item;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Programs
  // ──────────────────────────────────────────────────────────────────────────

  findAllPrograms(adminView = false) {
    const where = adminView ? {} : { active: true };
    return this.prisma.program.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createProgram(data: CreateProgramDto) {
    return this.prisma.program.create({ data });
  }

  async updateProgram(id: string, data: UpdateProgramDto) {
    await this.requireProgram(id);
    return this.prisma.program.update({ where: { id }, data });
  }

  async removeProgram(id: string) {
    await this.requireProgram(id);
    return this.prisma.program.delete({ where: { id } });
  }

  private async requireProgram(id: string) {
    const item = await this.prisma.program.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('البرنامج غير موجود');
    return item;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Document Types
  // ──────────────────────────────────────────────────────────────────────────

  findAllDocumentTypes(adminView = false) {
    const where = adminView ? {} : { active: true };
    return this.prisma.documentType.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  createDocumentType(data: CreateDocumentTypeDto) {
    return this.prisma.documentType.create({ data });
  }

  async updateDocumentType(id: string, data: UpdateDocumentTypeDto) {
    await this.requireDocumentType(id);
    return this.prisma.documentType.update({ where: { id }, data });
  }

  async removeDocumentType(id: string) {
    await this.requireDocumentType(id);
    return this.prisma.documentType.delete({ where: { id } });
  }

  private async requireDocumentType(id: string) {
    const item = await this.prisma.documentType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('نوع المستند غير موجود');
    return item;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Service Types
  // ──────────────────────────────────────────────────────────────────────────

  findAllServiceTypes(adminView = false) {
    const where = adminView ? {} : { active: true };
    return this.prisma.serviceType.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  createServiceType(data: CreateServiceTypeDto) {
    return this.prisma.serviceType.create({ data });
  }

  async updateServiceType(id: string, data: UpdateServiceTypeDto) {
    await this.requireServiceType(id);
    return this.prisma.serviceType.update({ where: { id }, data });
  }

  async removeServiceType(id: string) {
    await this.requireServiceType(id);
    return this.prisma.serviceType.delete({ where: { id } });
  }

  private async requireServiceType(id: string) {
    const item = await this.prisma.serviceType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('نوع الخدمة غير موجود');
    return item;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Dropdown Options
  // ──────────────────────────────────────────────────────────────────────────

  async findDropdownOptions(category?: string) {
    const where = category ? { category, active: true } : { active: true };
    const options = await this.prisma.dropdownOption.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { label: 'asc' }],
    });
    return this.groupByCategory(options);
  }

  async findDropdownOptionsAdmin() {
    const options = await this.prisma.dropdownOption.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { label: 'asc' }],
    });
    return this.groupByCategory(options);
  }

  async createDropdownOption(data: CreateDropdownOptionDto) {
    const existing = await this.prisma.dropdownOption.findUnique({
      where: { category_value: { category: data.category, value: data.value } },
    });
    if (existing) throw new ConflictException('الخيار موجود بالفعل في هذه الفئة');
    return this.prisma.dropdownOption.create({ data });
  }

  async updateDropdownOption(id: string, data: UpdateDropdownOptionDto) {
    const existing = await this.prisma.dropdownOption.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('الخيار غير موجود');
    return this.prisma.dropdownOption.update({ where: { id }, data });
  }

  async removeDropdownOption(id: string) {
    const existing = await this.prisma.dropdownOption.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('الخيار غير موجود');
    return this.prisma.dropdownOption.delete({ where: { id } });
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  System Config
  // ──────────────────────────────────────────────────────────────────────────

  findAllSystemConfig(group?: string) {
    const where = group ? { group } : {};
    return this.prisma.systemConfig.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  updateSystemConfig(key: string, data: UpdateSystemConfigDto) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: data.value,
        ...(data.label !== undefined ? { label: data.label } : {}),
      },
      create: { key, value: data.value, label: data.label, type: 'string' },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Helper
  // ──────────────────────────────────────────────────────────────────────────

  private groupByCategory<T extends { category: string }>(
    items: T[],
  ): Record<string, T[]> {
    const grouped: Record<string, T[]> = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }
    return grouped;
  }
}
