import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

function getCorsOrigins(): string[] | true {
  const origins = process.env.CORS_ORIGINS;
  if (!origins) {
    // Default allowed origins for development and production
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://ethos-care-system.vercel.app',
      'https://ethos-care-system-production.up.railway.app',
    ];
  }
  if (origins === '*') return true;
  return origins.split(',').map((o) => o.trim());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: getCorsOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
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
