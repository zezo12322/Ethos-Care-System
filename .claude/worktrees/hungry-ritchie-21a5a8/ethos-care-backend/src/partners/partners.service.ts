import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.partner.findUnique({ where: { id } });
  }

  async create(data: CreatePartnerDto) {
    return this.prisma.partner.create({ data });
  }

  async update(id: string, data: UpdatePartnerDto) {
    return this.prisma.partner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.partner.delete({
      where: { id },
    });
  }
}
