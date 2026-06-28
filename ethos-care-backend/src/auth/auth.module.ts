import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import type { StringValue } from 'ms';

const WEAK_JWT_SECRETS = new Set([
  'change-me',
  'JWT_SECRET',
  'ethos-care-default-secret',
  'secret',
  'password',
]);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  // أمان: لا تسمح بالتشغيل بسرّ ناقص أو ضعيف أو معروف.
  // أي حد يخمّن السرّ يقدر يزوّر توكنات ويوصل لبيانات حسّاسة.
  if (!secret || secret.length < 16 || WEAK_JWT_SECRETS.has(secret)) {
    throw new Error(
      'JWT_SECRET غير مضبوط أو ضعيف. عيّن سرًّا عشوائيًّا قويًّا (32+ حرفًا) في إعدادات الخادم قبل التشغيل. ' +
        '[JWT_SECRET is missing or too weak — set a strong random secret (32+ chars) before starting.]',
    );
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
