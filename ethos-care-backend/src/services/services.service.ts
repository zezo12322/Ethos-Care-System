import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.serviceType.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  findAllAdmin() {
    return this.prisma.serviceType.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.serviceType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('نوع الخدمة غير موجود');
    return item;
  }

  create(data: CreateServiceTypeDto) {
    return this.prisma.serviceType.create({ data });
  }

  async update(id: string, data: UpdateServiceTypeDto) {
    await this.findOne(id);
    return this.prisma.serviceType.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.serviceType.delete({ where: { id } });
  }
}
