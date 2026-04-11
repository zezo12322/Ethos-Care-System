import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CasesModule } from './cases/cases.module';
import { LocationsModule } from './locations/locations.module';
import { PartnersModule } from './partners/partners.module';
import { ServicesModule } from './services/services.module';
import { DocumentTypesModule } from './document-types/document-types.module';
import { AuthModule } from './auth/auth.module';
import { FamiliesController } from './families/families.controller';
import { OperationsController } from './operations/operations.controller';
import { PrismaModule } from './prisma/prisma.module';
import { FamiliesService } from './families/families.service';
import { OperationsService } from './operations/operations.service';
import { StatsModule } from './stats/stats.module';
import { SearchModule } from './search/search.module';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { PublicModule } from './public/public.module';
import {
  RateLimitMiddleware,
  AuthRateLimitMiddleware,
} from './common/rate-limit.middleware';

@Module({
  imports: [
    CasesModule,
    LocationsModule,
    PartnersModule,
    ServicesModule,
    DocumentTypesModule,
    AuthModule,
    PrismaModule,
    StatsModule,
    SearchModule,
    UsersModule,
    NewsModule,
    PublicModule,
  ],
  controllers: [AppController, FamiliesController, OperationsController],
  providers: [AppService, FamiliesService, OperationsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Strict rate limit on login endpoint (5 req/min per IP)
    consumer.apply(AuthRateLimitMiddleware).forRoutes('api/auth/login');
    // General rate limit on all API endpoints (30 req/min per IP)
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
