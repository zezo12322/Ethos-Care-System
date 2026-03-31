import { Injectable } from '@nestjs/common';

@Injectable()
export class ServicesService {
  findAll() {
    return [
      { id: 'economic', name: 'تمكين اقتصادي', category: 'development' },
      { id: 'medical', name: 'تدخل طبي', category: 'health' },
      { id: 'housing', name: 'سكن كريم', category: 'housing' },
      { id: 'education', name: 'دعم تعليمي', category: 'education' },
    ];
  }
}
