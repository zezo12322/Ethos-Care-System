import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@Injectable()
export class DocumentTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.documentType.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  findAllAdmin() {
    return this.prisma.documentType.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.documentType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('نوع المستند غير موجود');
    return item;
  }

  create(data: CreateDocumentTypeDto) {
    return this.prisma.documentType.create({ data });
  }

  async update(id: string, data: UpdateDocumentTypeDto) {
    await this.findOne(id);
    return this.prisma.documentType.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.documentType.delete({ where: { id } });
  }
}
