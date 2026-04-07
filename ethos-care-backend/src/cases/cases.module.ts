import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CasePdfService } from './case-pdf.service';

@Module({
  controllers: [CasesController],
  providers: [CasesService, CasePdfService],
})
export class CasesModule {}
