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
    return this.prisma.location.create({ data });
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
