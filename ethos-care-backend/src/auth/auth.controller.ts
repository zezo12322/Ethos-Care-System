import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: LoginDto) {
    const username = signInDto.nationalId || signInDto.email;
    const user = await this.prisma.user.findUnique({ where: { email: username } });
    
    if (user && user.password === signInDto.password) {
      return {
        access_token: `mock_jwt_token_${user.id}`,
        user: { id: user.id, name: user.name, role: user.role, email: user.email },
      };
    }

    throw new UnauthorizedException('بيانات الدخول غير صحيحة');
  }

  @Get('me')
  async getMe(@Headers('authorization') auth: string) {
    if (!auth) throw new UnauthorizedException();
    const token = auth.replace('Bearer ', '');
    const id = token.replace('mock_jwt_token_', '');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    
    return { id: user.id, name: user.name, role: user.role, email: user.email, branch: 'بني سويف' };
  }
}
