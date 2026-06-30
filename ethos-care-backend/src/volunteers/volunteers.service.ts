import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVolunteerDto,
  VOLUNTEER_STATUSES,
} from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import {
  AssignVolunteerDto,
  UpdateAssignmentDto,
} from './dto/assign-volunteer.dto';

const assignmentInclude = {
  assignments: {
    include: { operation: true },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.VolunteerInclude;

type VolunteerWithAssignments = Prisma.VolunteerGetPayload<{
  include: typeof assignmentInclude;
}>;

@Injectable()
export class VolunteersService {
  constructor(private prisma: PrismaService) {}

  /** يضيف إجمالي ساعات التطوع (من الأنشطة التي حضرها) وعدد الأنشطة */
  private decorate(volunteer: VolunteerWithAssignments) {
    const totalHours = volunteer.assignments
      .filter((a) => a.attended)
      .reduce((sum, a) => sum + (a.hours ?? 0), 0);
    return {
      ...volunteer,
      totalHours,
      assignmentsCount: volunteer.assignments.length,
    };
  }

  async findAll(filters: { status?: string; search?: string } = {}) {
    const where: Prisma.VolunteerWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const query = filters.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { preferredArea: { contains: query, mode: 'insensitive' } },
        { skills: { contains: query, mode: 'insensitive' } },
      ];
    }

    const volunteers = await this.prisma.volunteer.findMany({
      where,
      include: assignmentInclude,
      orderBy: { createdAt: 'desc' },
    });
    return volunteers.map((v) => this.decorate(v));
  }

  async findOne(id: string) {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id },
      include: assignmentInclude,
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    return this.decorate(volunteer);
  }

  async create(data: CreateVolunteerDto, source = 'MANUAL') {
    const volunteer = await this.prisma.volunteer.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        age: data.age ?? null,
        preferredArea: data.preferredArea || null,
        skills: data.skills || null,
        status: data.status || 'PENDING',
        notes: data.notes || null,
        source,
      },
      include: assignmentInclude,
    });
    return this.decorate(volunteer);
  }

  async update(id: string, data: UpdateVolunteerDto) {
    await this.ensureExists(id);
    const volunteer = await this.prisma.volunteer.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
        ...(data.age !== undefined ? { age: data.age ?? null } : {}),
        ...(data.preferredArea !== undefined
          ? { preferredArea: data.preferredArea || null }
          : {}),
        ...(data.skills !== undefined ? { skills: data.skills || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      },
      include: assignmentInclude,
    });
    return this.decorate(volunteer);
  }

  async setStatus(id: string, status: string) {
    if (!VOLUNTEER_STATUSES.includes(status as never)) {
      throw new BadRequestException('حالة المتطوع غير صحيحة');
    }
    await this.ensureExists(id);
    const volunteer = await this.prisma.volunteer.update({
      where: { id },
      data: { status },
      include: assignmentInclude,
    });
    return this.decorate(volunteer);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.volunteer.delete({ where: { id } });
  }

  async assignToOperation(volunteerId: string, data: AssignVolunteerDto) {
    await this.ensureExists(volunteerId);
    const operation = await this.prisma.operation.findUnique({
      where: { id: data.operationId },
    });
    if (!operation) {
      throw new NotFoundException('Operation not found');
    }

    // upsert: لو المتطوع مُسند بالفعل لنفس النشاط نحدّث بدل ما نكرّر
    return this.prisma.volunteerAssignment.upsert({
      where: {
        volunteerId_operationId: {
          volunteerId,
          operationId: data.operationId,
        },
      },
      create: {
        volunteerId,
        operationId: data.operationId,
        role: data.role || null,
        attended: data.attended ?? false,
        hours: data.hours ?? 0,
        notes: data.notes || null,
      },
      update: {
        ...(data.role !== undefined ? { role: data.role || null } : {}),
        ...(data.attended !== undefined ? { attended: data.attended } : {}),
        ...(data.hours !== undefined ? { hours: data.hours } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      },
      include: { operation: true },
    });
  }

  async updateAssignment(assignmentId: string, data: UpdateAssignmentDto) {
    const existing = await this.prisma.volunteerAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }
    return this.prisma.volunteerAssignment.update({
      where: { id: assignmentId },
      data: {
        ...(data.role !== undefined ? { role: data.role || null } : {}),
        ...(data.attended !== undefined ? { attended: data.attended } : {}),
        ...(data.hours !== undefined ? { hours: data.hours } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      },
      include: { operation: true },
    });
  }

  async removeAssignment(assignmentId: string) {
    const existing = await this.prisma.volunteerAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }
    return this.prisma.volunteerAssignment.delete({
      where: { id: assignmentId },
    });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.volunteer.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Volunteer not found');
    }
  }
}
