import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import type { StringValue } from 'ms';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('WARNING: JWT_SECRET not set — using fallback. Set a strong secret in production.');
    return 'ethos-care-default-secret';
  }
  if (secret === 'change-me') {
    console.warn('WARNING: JWT_SECRET is still the default "change-me". Set a strong secret in production.');
  }
  return secret;
}

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
