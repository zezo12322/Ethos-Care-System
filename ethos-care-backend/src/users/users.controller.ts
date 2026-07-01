import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CEO')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private assertCanAssignRole(currentUser: AuthUser, nextRole?: string) {
    if (currentUser.role === 'CEO' && nextRole === 'ADMIN') {
      throw new ForbiddenException(
        'المدير التنفيذي لا يمكنه إنشاء أو ترقية حساب إلى مدير نظام',
      );
    }
  }

  private async assertCanManageTargetUser(
    currentUser: AuthUser,
    targetUserId: string,
  ) {
    const targetUser = await this.usersService.findById(targetUserId);

    if (!targetUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (currentUser.id === targetUserId) {
      throw new ForbiddenException(
        'لا يمكنك تنفيذ هذا الإجراء على حسابك الحالي',
      );
    }

    if (currentUser.role === 'CEO' && targetUser.role === 'ADMIN') {
      throw new ForbiddenException(
        'المدير التنفيذي لا يمكنه إدارة حسابات مدير النظام',
      );
    }
  }

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    this.assertCanAssignRole(currentUser, createUserDto.role);
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    await this.assertCanManageTargetUser(currentUser, id);
    this.assertCanAssignRole(currentUser, updateUserDto.role);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: AuthUser) {
    await this.assertCanManageTargetUser(currentUser, id);
    return this.usersService.remove(id);
  }
}
