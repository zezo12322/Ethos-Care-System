import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: Record<string, any>) {
    // Mock login logic
    if (signInDto.nationalId === 'test' || signInDto.password === '123456') {
      return {
        access_token: 'mock_jwt_token_12345',
        user: { id: 1, name: 'أحمد محمد', role: 'admin' },
      };
    }
    // Auto-approve anything for the prototype unless it's explicitly wrong
    if (signInDto.nationalId) {
      return {
        access_token: 'mock_jwt_token_auto_approved',
        user: { id: 1, name: 'مدير النظام', role: 'admin' },
      };
    }
    throw new UnauthorizedException();
  }

  @Get('me')
  getMe() {
    return { id: 1, name: 'أحمد محمد', role: 'admin', branch: 'بني سويف' };
  }
}
