import './config/init-env';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

function getCorsOrigins(): string[] | true {
  const origins = process.env.CORS_ORIGINS;
  if (!origins) {
    // Default allowed origins for development and production
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://lifemakers-bns.com',
      'https://www.lifemakers-bns.com',
      'https://ethos-care-system.vercel.app',
    ];
  }
  if (origins === '*') return true;
  return origins.split(',').map((o) => o.trim());
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // خلف Azure App Service / load balancer: نثق ببروكسي واحد لقراءة IP العميل الحقيقي
  app.set('trust proxy', 1);

  // رؤوس أمان + ضغط الاستجابات
  app.use(helmet());
  app.use(compression());

  const corsOrigins = getCorsOrigins();
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // لا نجمع بين origin مفتوح (*) وcredentials — إعداد خطير
    credentials: corsOrigins !== true,
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable global prefix
  app.setGlobalPrefix('api');

  // Next.js uses 3000 by default, so maybe we should run backend on 3001
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
