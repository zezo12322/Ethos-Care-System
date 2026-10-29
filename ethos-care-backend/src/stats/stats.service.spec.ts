import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('StatsService.getLiveStats', () => {
  it('buckets today into the last trend slot and names workload owners', async () => {
    const prisma = {
      case: {
        groupBy: jest
          .fn()
          .mockResolvedValueOnce([{ lifecycleStatus: 'REVIEW', _count: 3 }])
          .mockResolvedValueOnce([{ priority: 'URGENT', _count: 2 }])
          .mockResolvedValueOnce([
            { assignedToId: null, _count: 1 },
            { assignedToId: 'u1', _count: 4 },
          ]),
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([{ createdAt: new Date() }]),
      },
      caseHistory: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      family: { count: jest.fn().mockResolvedValue(0) },
      user: {
        findMany: jest.fn().mockResolvedValue([{ id: 'u1', name: 'سارة' }]),
      },
    };
    const service = new StatsService(prisma as unknown as PrismaService);

    const live = await service.getLiveStats();

    expect(live.trend).toHaveLength(14);
    expect(live.trend[13].count).toBe(1);
    expect(live.trend[13].date).toBe(new Date().toLocaleDateString('en-CA'));
    expect(live.cases.byLifecycle.REVIEW).toBe(3);
    expect(live.cases.openByPriority.URGENT).toBe(2);
    expect(live.workload[0]).toEqual({ userId: 'u1', name: 'سارة', open: 4 });
    expect(live.workload[1].name).toBe('غير مُسندة');
  });
});
