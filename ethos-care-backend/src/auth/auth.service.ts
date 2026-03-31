import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const username = loginDto.email?.trim() || loginDto.nationalId?.trim();

    if (!username) {
      throw new BadRequestException(
        'يجب إدخال البريد الإلكتروني أو رقم التعريف',
      );
    }

    const user = await this.usersService.findByEmail(username);
    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    let isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid && user.password === loginDto.password) {
      isPasswordValid = true;
      await this.usersService.update(user.id, { password: loginDto.password });
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const safeUser = this.usersService.sanitizeUser(user);
    const accessToken = await this.jwtService.signAsync({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
      name: safeUser.name,
    });

    return {
      access_token: accessToken,
      user: safeUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.usersService.sanitizeUser(user);
  }
}
