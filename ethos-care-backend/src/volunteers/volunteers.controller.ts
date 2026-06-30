import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import {
  AssignVolunteerDto,
  UpdateAssignmentDto,
} from './dto/assign-volunteer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CEO', 'MANAGER')
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.volunteersService.findAll({ status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.volunteersService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateVolunteerDto) {
    return this.volunteersService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateVolunteerDto) {
    return this.volunteersService.update(id, data);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.volunteersService.setStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.volunteersService.remove(id);
  }

  @Post(':id/assignments')
  assign(@Param('id') id: string, @Body() data: AssignVolunteerDto) {
    return this.volunteersService.assignToOperation(id, data);
  }

  @Patch('assignments/:assignmentId')
  updateAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() data: UpdateAssignmentDto,
  ) {
    return this.volunteersService.updateAssignment(assignmentId, data);
  }

  @Delete('assignments/:assignmentId')
  removeAssignment(@Param('assignmentId') assignmentId: string) {
    return this.volunteersService.removeAssignment(assignmentId);
  }
}
