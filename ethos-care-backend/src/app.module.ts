import { Module } from '@nestjs/common';
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
  ],
  controllers: [AppController, FamiliesController, OperationsController],
  providers: [AppService, FamiliesService, OperationsService],
})
export class AppModule {}
