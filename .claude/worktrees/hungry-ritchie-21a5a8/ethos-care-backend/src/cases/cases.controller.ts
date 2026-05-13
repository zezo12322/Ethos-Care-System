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
  'CALL_CENTER',
)
@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly casePdfService: CasePdfService,
  ) {}

  @Post()
  @Roles('ADMIN', 'CEO', 'MANAGER', 'CASE_WORKER', 'DATA_ENTRY', 'EXECUTION_OFFICER')
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
  @Roles('ADMIN', 'CEO', 'MANAGER', 'CASE_WORKER', 'DATA_ENTRY', 'EXECUTION_OFFICER')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'CEO', 'MANAGER', 'CASE_WORKER', 'DATA_ENTRY', 'EXECUTION_OFFICER')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }

  /* ──────────────────────────────────────────────
   *  Lifecycle:  DRAFT → REVIEW → FIELD_VERIFICATION → APPROVED → EXECUTION → COMPLETED
   *  First 3 stages  → Researcher  (CASE_WORKER / DATA_ENTRY)
   *  Last  3 stages  → Case Manager (MANAGER / CEO)
   *  ADMIN can do everything.
   * ────────────────────────────────────────────── */

  // Researcher: DRAFT → REVIEW
  @Post(':id/transitions/review')
  @Roles('ADMIN', 'CASE_WORKER', 'DATA_ENTRY')
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

  // Researcher: REVIEW → FIELD_VERIFICATION
  @Post(':id/transitions/field_verify')
  @Roles('ADMIN', 'CASE_WORKER', 'DATA_ENTRY')
  transitionFieldVerify(
    @Param('id') id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.casesService.transition(
      id,
      'FIELD_VERIFICATION',
      'PENDING_DECISION',
      'field_verify',
      body.reason,
      user.id,
    );
  }

  // Case Manager: FIELD_VERIFICATION → APPROVED
  @Post(':id/transitions/approve')
  @Roles('ADMIN', 'CEO', 'MANAGER')
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

  // Case Manager: APPROVED → EXECUTION
  @Post(':id/transitions/execute')
  @Roles('ADMIN', 'CEO', 'MANAGER')
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

  // Case Manager: EXECUTION → COMPLETED
  @Post(':id/transitions/complete')
  @Roles('ADMIN', 'CEO', 'MANAGER')
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

  // Case Manager: return to DRAFT (any stage)
  @Post(':id/transitions/return_to_draft')
  @Roles('ADMIN', 'CEO', 'MANAGER')
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
