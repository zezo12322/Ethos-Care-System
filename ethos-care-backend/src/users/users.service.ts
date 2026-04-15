import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  sanitizeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = this.normalizeEmail(email);
    return this.prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserDto): Promise<SafeUser> {
    const normalizedEmail = this.normalizeEmail(data.email);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const existingUser = await this.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
      select: userSelect,
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<SafeUser> {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.email !== undefined) {
      const normalizedEmail = this.normalizeEmail(data.email);
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
      }

      updateData.email = normalizedEmail;
    }

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  }

  async remove(id: string): Promise<SafeUser> {
    return this.prisma.user.delete({ where: { id }, select: userSelect });
  }
}
