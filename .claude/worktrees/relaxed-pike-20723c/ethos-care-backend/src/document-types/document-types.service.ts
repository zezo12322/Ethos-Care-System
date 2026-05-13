import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentTypesService {
  findAll() {
    return [
      { id: 'national-id', name: 'صورة الرقم القومي' },
      { id: 'medical-report', name: 'تقرير طبي' },
      { id: 'income-proof', name: 'إثبات دخل' },
      { id: 'housing-photo', name: 'صور حالة السكن' },
    ];
  }
}
