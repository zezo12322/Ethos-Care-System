import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  'ADMIN',
  'CEO',
  'MANAGER',
  'CASE_WORKER',
  'DATA_ENTRY',
  'EXECUTION_OFFICER',
)
@Controller('families')
export class FamiliesController {
  constructor(private familiesService: FamiliesService) {}

  @Get()
  async findAll() {
    const families = await this.familiesService.findAll();
    return families.map((f) => ({
      id: f.id,
      headName: f.headName,
      membersCount: f.membersCount,
      income: `${f.income} ج.م`,
      address: f.address,
      phone: f.phone,
      lastVisit: f.lastVisit
        ? f.lastVisit.toISOString().split('T')[0]
        : 'غير محدد',
      status: f.status,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Post()
  async create(@Body() newFamily: CreateFamilyDto) {
    const f = await this.familiesService.create(newFamily);
    return {
      id: f.id,
      headName: f.headName,
      membersCount: f.membersCount,
      income: `${f.income} ج.م`,
      address: f.address,
      phone: f.phone,
      lastVisit: f.lastVisit
        ? f.lastVisit.toISOString().split('T')[0]
        : 'غير محدد',
      status: f.status,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateFamilyDto) {
    const f = await this.familiesService.update(id, updateData);
    return {
      id: f.id,
      headName: f.headName,
      membersCount: f.membersCount,
      income: `${f.income} ج.م`,
      address: f.address,
      phone: f.phone,
      lastVisit: f.lastVisit
        ? f.lastVisit.toISOString().split('T')[0]
        : 'غير محدد',
      status: f.status,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.familiesService.remove(id);
  }
}
