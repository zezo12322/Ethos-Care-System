import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CEO', 'CASE_WORKER', 'CALL_CENTER')
@Controller('families')
export class FamiliesController {
  constructor(private familiesService: FamiliesService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const families = await this.familiesService.findAll({ status, search });
    return families.map((f) => ({
      id: f.id,
      headName: f.headName,
      nationalId: f.nationalId,
      membersCount: f.membersCount,
      income: `${f.income} ج.م`,
      address: f.address || f.addressDetails || 'غير محدد',
      addressDetails: f.addressDetails,
      phone: f.phone,
      city: f.city,
      village: f.village,
      socialStatus: f.socialStatus,
      job: f.job,
      education: f.education,
      lastVisit: f.lastVisit
        ? f.lastVisit.toISOString().split('T')[0]
        : 'غير محدد',
      status: f.status,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
      cases: f.cases,
    }));
  }

  @Get(':id')
  @Roles('ADMIN', 'CEO', 'CASE_WORKER', 'CALL_CENTER', 'VOLUNTEER')
  async findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'CEO', 'CASE_WORKER', 'VOLUNTEER')
  async create(@Body() newFamily: CreateFamilyDto) {
    const f = await this.familiesService.create(newFamily);
    return {
      id: f.id,
      headName: f.headName,
      nationalId: f.nationalId,
      membersCount: f.membersCount,
      income: `${f.income} ج.م`,
      address: f.address || f.addressDetails || 'غير محدد',
      addressDetails: f.addressDetails,
      phone: f.phone,
      city: f.city,
      village: f.village,
      socialStatus: f.socialStatus,
      job: f.job,
      education: f.education,
      lastVisit: f.lastVisit
        ? f.lastVisit.toISOString().split('T')[0]
        : 'غير محدد',
      status: f.status,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    };
  }

  @Patch(':id')
  @Roles('ADMIN', 'CEO', 'CASE_WORKER')
  async update(@Param('id') id: string, @Body() updateData: UpdateFamilyDto) {
    const f = await this.familiesService.update(id, updateData);
    return {
      id: f.id,
      headName: f.headName,
      nationalId: f.nationalId,
      membersCount: f.membersCount,
      income: `${f.income} ج.م`,
      address: f.address || f.addressDetails || 'غير محدد',
      addressDetails: f.addressDetails,
      phone: f.phone,
      city: f.city,
      village: f.village,
      socialStatus: f.socialStatus,
      job: f.job,
      education: f.education,
      lastVisit: f.lastVisit
        ? f.lastVisit.toISOString().split('T')[0]
        : 'غير محدد',
      status: f.status,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    };
  }

  @Delete(':id')
  @Roles('ADMIN', 'CEO', 'CASE_WORKER')
  async remove(@Param('id') id: string) {
    return this.familiesService.remove(id);
  }
}
