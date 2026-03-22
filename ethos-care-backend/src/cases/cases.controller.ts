import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';

@Controller('cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  async findAll() {
    const cases = await this.casesService.findAll();
    return cases.map(c => ({
      id: c.id,
      name: c.applicantName,
      type: c.caseType,
      status: c.status,
      priority: c.priority,
      date: c.createdAt.toISOString().split('T')[0],
      location: c.location
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  async create(@Body() newCase: CreateCaseDto) {
    const created = await this.casesService.create(newCase);
    return {
      id: created.id,
      name: created.applicantName,
      type: created.caseType,
      status: created.status,
      priority: created.priority,
      date: created.createdAt.toISOString().split('T')[0],
      location: created.location
    };
  }
}
