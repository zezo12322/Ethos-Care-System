import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TransitionCaseDto } from './dto/transition-case.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import type { Response } from 'express';
import { CasePdfService } from './case-pdf.service';
import { buildCasePdfFilename } from './utils/case-pdf-filename';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  'ADMIN',
  'CEO',
  'MANAGER',
  'CASE_WORKER',
  'DATA_ENTRY',
  'EXECUTION_OFFICER',
)
@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly casePdfService: CasePdfService,
  ) {}

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

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const caseData = await this.casesService.findOne(id);
    const pdfBuffer = await this.casePdfService.generateCasePdf(caseData);
    const filename = buildCasePdfFilename(
      caseData.applicantName,
      caseData.id.slice(0, 8).toUpperCase(),
    );

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );

    return new StreamableFile(pdfBuffer);
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
  transitionReview(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'INTAKE_REVIEW',
      'PENDING_DECISION',
      'review',
      body.reason,
      user.id,
    );
  }

  @Post(':id/transitions/approve')
  transitionApprove(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'APPROVED',
      'APPROVED',
      'approve',
      body.reason,
      user.id,
    );
  }

  @Post(':id/transitions/reject')
  transitionReject(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'REJECTED',
      'REJECTED',
      'reject',
      body.reason,
      user.id,
    );
  }

  @Post(':id/transitions/complete')
  transitionComplete(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'COMPLETED',
      'APPROVED',
      'complete',
      body.reason,
      user.id,
    );
  }

  @Post(':id/transitions/technical_reject')
  transitionTechnicalReject(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'TECH_REJECTED',
      'APPROVED',
      'technical_reject',
      body.reason,
      user.id,
    );
  }

  @Post(':id/transitions/return_to_review')
  transitionReturnToReview(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'DRAFT',
      'PENDING_DECISION',
      'return_to_review',
      body.reason,
      user.id,
    );
  }
}
