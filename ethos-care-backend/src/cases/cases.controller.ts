import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @Get('queues/urgent')
  getUrgentQueue() {
    return this.casesService.getUrgentQueue();
  }

  @Get('queues/missing-national-id')
  getMissingNationalIdQueue() {
    return this.casesService.getMissingNationalIdQueue();
  }

  @Get('queues/under-review')
  getUnderReviewQueue() {
    return this.casesService.getUnderReviewQueue();
  }

  @Get('queues/awaiting-execution')
  getAwaitingExecutionQueue() {
    return this.casesService.getAwaitingExecutionQueue();
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.casesService.findAll({ status, type, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.casesService.getHistory(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }

  @Post(':id/transitions/review')
  transitionReview(@Param('id') id: string, @Body() body: any) {
    return this.casesService.transition(id, 'INTAKE_REVIEW', 'PENDING_DECISION', 'review', body.reason);
  }

  @Post(':id/transitions/approve')
  transitionApprove(@Param('id') id: string, @Body() body: any) {
    return this.casesService.transition(id, 'APPROVED', 'APPROVED', 'approve', body.reason);
  }

  @Post(':id/transitions/reject')
  transitionReject(@Param('id') id: string, @Body() body: any) {
    return this.casesService.transition(id, 'REJECTED', 'REJECTED', 'reject', body.reason);
  }

  @Post(':id/transitions/complete')
  transitionComplete(@Param('id') id: string, @Body() body: any) {
    return this.casesService.transition(id, 'COMPLETED', 'APPROVED', 'complete', body.reason);
  }

  @Post(':id/transitions/technical_reject')
  transitionTechnicalReject(@Param('id') id: string, @Body() body: any) {
    return this.casesService.transition(id, 'TECH_REJECTED', 'APPROVED', 'technical_reject', body.reason);
  }

  @Post(':id/transitions/return_to_review')
  transitionReturnToReview(@Param('id') id: string, @Body() body: any) {
    return this.casesService.transition(id, 'DRAFT', 'PENDING_DECISION', 'return_to_review', body.reason);
  }
}
