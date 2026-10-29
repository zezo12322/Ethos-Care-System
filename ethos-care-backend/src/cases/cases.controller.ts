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
@Roles('ADMIN', 'CEO', 'CASE_WORKER', 'CALL_CENTER')
@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly casePdfService: CasePdfService,
  ) {}

  @Post()
  @Roles('ADMIN', 'CEO', 'CASE_WORKER', 'VOLUNTEER')
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
  @Roles('ADMIN', 'CEO')
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
  @Roles('ADMIN', 'CEO', 'CASE_WORKER')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'CEO', 'CASE_WORKER')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }

  /* ──────────────────────────────────────────────
   *  Lifecycle:  DRAFT → REVIEW → FIELD_VERIFICATION → APPROVED → EXECUTION → COMPLETED
   *  Volunteer submits → DRAFT (with the researcher)
   *  Researcher (CASE_WORKER) → REVIEW (raised to the director)
   *  Director (CEO) → APPROVED / REJECTED → EXECUTION → COMPLETED
   *  ADMIN can do everything.
   * ────────────────────────────────────────────── */

  // Researcher: DRAFT → REVIEW (موافقة/رفض فقط تُرفع للمدير)
  @Post(':id/transitions/review')
  @Roles('ADMIN', 'CASE_WORKER')
  transitionReview(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'REVIEW',
      'PENDING_DECISION',
      'review',
      body.reason,
      user.id,
    );
  }

  // Director: REVIEW → APPROVED
  @Post(':id/transitions/approve')
  @Roles('ADMIN', 'CEO')
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

  // Director: REVIEW → REJECTED
  @Post(':id/transitions/reject')
  @Roles('ADMIN', 'CEO')
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

  // Director: APPROVED → EXECUTION
  @Post(':id/transitions/execute')
  @Roles('ADMIN', 'CEO')
  transitionExecute(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'EXECUTION',
      'APPROVED',
      'execute',
      body.reason,
      user.id,
    );
  }

  // Director: EXECUTION → COMPLETED
  @Post(':id/transitions/complete')
  @Roles('ADMIN', 'CEO')
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

  // Director: return to the researcher (any stage)
  @Post(':id/transitions/return_to_draft')
  @Roles('ADMIN', 'CEO')
  transitionReturnToDraft(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'DRAFT',
      'PENDING_DECISION',
      'return_to_draft',
      body.reason,
      user.id,
    );
  }
}
