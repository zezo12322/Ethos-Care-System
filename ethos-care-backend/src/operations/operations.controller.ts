import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';

@Controller('operations')
export class OperationsController {
  constructor(private operationsService: OperationsService) {}

  @Get()
  async findAll() {
    const ops = await this.operationsService.findAll();
    return ops.map(o => ({
      id: o.id,
      title: o.name,
      type: o.type,
      targetFamilies: o.target,
      budget: `غير متوفر ج.م`, // Since budget was removed from schema
      location: `غير محدد`,  // Replaced with other fields in schema maybe
      date: o.date.toISOString().split('T')[0],
      status: o.status
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.operationsService.findOne(id);
  }

  @Post()
  async create(@Body() newOp: CreateOperationDto) {
    const o = await this.operationsService.create(newOp);
    return {
      id: o.id,
      title: o.name,
      type: o.type,
      targetFamilies: o.target,
      budget: `غير متوفر ج.م`,
      location: `غير محدد`,
      date: o.date.toISOString().split('T')[0],
      status: o.status
    };
  }
}
