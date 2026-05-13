import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateNewsDto) {
    return this.prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category || 'فعاليات',
        image: data.image,
        published: data.published ?? true,
      },
    });
  }

  findAll() {
    return this.prisma.news.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.news.findMany({ orderBy: { date: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.news.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateNewsDto) {
    return this.prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        image: data.image,
        published: data.published,
      },
    });
  }

  remove(id: string) {
    return this.prisma.news.delete({ where: { id } });
  }
}
