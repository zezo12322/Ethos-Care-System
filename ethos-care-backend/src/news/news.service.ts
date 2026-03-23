import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.news.create({ data });
  }

  findAll() {
    return this.prisma.news.findMany({ orderBy: { date: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.news.findUnique({ where: { id } });
  }

  update(id: string, data: any) {
    return this.prisma.news.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.news.delete({ where: { id } });
  }
}
