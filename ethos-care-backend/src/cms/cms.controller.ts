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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CmsService } from './cms.service';
import { UpdateContentDto } from './dto/update-content.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateDropdownOptionDto } from './dto/create-dropdown-option.dto';
import { UpdateDropdownOptionDto } from './dto/update-dropdown-option.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { CreateServiceTypeDto } from '../services/dto/create-service-type.dto';
import { UpdateServiceTypeDto } from '../services/dto/update-service-type.dto';
import { CreateDocumentTypeDto } from '../document-types/dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from '../document-types/dto/update-document-type.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ── Public aggregated ──────────────────────────────────────────────────────

  @Get('public')
  getPublic() {
    return this.cmsService.getPublicData();
  }

  // ── Site Content ───────────────────────────────────────────────────────────

  @Get('content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  findAllContent() {
    return this.cmsService.findAllContent();
  }

  @Patch('content/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  updateContent(@Param('key') key: string, @Body() dto: UpdateContentDto) {
    return this.cmsService.updateContent(key, dto);
  }

  // ── Campaigns ──────────────────────────────────────────────────────────────

  @Get('campaigns')
  findCampaigns(@Query('admin') admin?: string) {
    return this.cmsService.findAllCampaigns(admin === 'true');
  }

  @Post('campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.cmsService.createCampaign(dto);
  }

  @Patch('campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.cmsService.updateCampaign(id, dto);
  }

  @Delete('campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  removeCampaign(@Param('id') id: string) {
    return this.cmsService.removeCampaign(id);
  }

  // ── Programs ───────────────────────────────────────────────────────────────

  @Get('programs')
  findPrograms(@Query('admin') admin?: string) {
    return this.cmsService.findAllPrograms(admin === 'true');
  }

  @Post('programs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  createProgram(@Body() dto: CreateProgramDto) {
    return this.cmsService.createProgram(dto);
  }

  @Patch('programs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  updateProgram(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.cmsService.updateProgram(id, dto);
  }

  @Delete('programs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  removeProgram(@Param('id') id: string) {
    return this.cmsService.removeProgram(id);
  }

  // ── Document Types ─────────────────────────────────────────────────────────

  @Get('document-types')
  findDocumentTypes(@Query('admin') admin?: string) {
    return this.cmsService.findAllDocumentTypes(admin === 'true');
  }

  @Post('document-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  createDocumentType(@Body() dto: CreateDocumentTypeDto) {
    return this.cmsService.createDocumentType(dto);
  }

  @Patch('document-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  updateDocumentType(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentTypeDto,
  ) {
    return this.cmsService.updateDocumentType(id, dto);
  }

  @Delete('document-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  removeDocumentType(@Param('id') id: string) {
    return this.cmsService.removeDocumentType(id);
  }

  // ── Service Types ──────────────────────────────────────────────────────────

  @Get('service-types')
  findServiceTypes(@Query('admin') admin?: string) {
    return this.cmsService.findAllServiceTypes(admin === 'true');
  }

  @Post('service-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  createServiceType(@Body() dto: CreateServiceTypeDto) {
    return this.cmsService.createServiceType(dto);
  }

  @Patch('service-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  updateServiceType(
    @Param('id') id: string,
    @Body() dto: UpdateServiceTypeDto,
  ) {
    return this.cmsService.updateServiceType(id, dto);
  }

  @Delete('service-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  removeServiceType(@Param('id') id: string) {
    return this.cmsService.removeServiceType(id);
  }

  // ── Dropdown Options ───────────────────────────────────────────────────────

  @Get('dropdown-options')
  findDropdownOptions(@Query('category') category?: string) {
    return this.cmsService.findDropdownOptions(category);
  }

  @Get('dropdown-options/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  findDropdownOptionsAdmin() {
    return this.cmsService.findDropdownOptionsAdmin();
  }

  @Post('dropdown-options')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  createDropdownOption(@Body() dto: CreateDropdownOptionDto) {
    return this.cmsService.createDropdownOption(dto);
  }

  @Patch('dropdown-options/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  updateDropdownOption(
    @Param('id') id: string,
    @Body() dto: UpdateDropdownOptionDto,
  ) {
    return this.cmsService.updateDropdownOption(id, dto);
  }

  @Delete('dropdown-options/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  removeDropdownOption(@Param('id') id: string) {
    return this.cmsService.removeDropdownOption(id);
  }

  // ── System Config ──────────────────────────────────────────────────────────

  @Get('system-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  findAllSystemConfig(@Query('group') group?: string) {
    return this.cmsService.findAllSystemConfig(group);
  }

  @Patch('system-config/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO')
  updateSystemConfig(
    @Param('key') key: string,
    @Body() dto: UpdateSystemConfigDto,
  ) {
    return this.cmsService.updateSystemConfig(key, dto);
  }
}
