import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.location.findUnique({ where: { id } });
  }

  async create(data: CreateLocationDto) {
    const name = data.name?.trim() ?? '';
    const type = data.type?.trim() || 'قرية';
    const region = (data.region ?? '').trim();

    // منع التكرار: لو فيه موقع بنفس الاسم والنوع والمنطقة، رجّعه بدل إنشاء نسخة جديدة.
    // ده بيوقف تزايد عدد القرى لو أي مسار حاول يضيف نفس القرية أكتر من مرة.
    const existing = await this.prisma.location.findFirst({
      where: { name, type, region },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.location.create({
      data: { ...data, name, type, region },
    });
  }

  async update(id: string, data: UpdateLocationDto) {
    return this.prisma.location.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.location.delete({
      where: { id },
    });
  }
}
