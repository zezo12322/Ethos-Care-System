import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CasesService } from './cases.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CasesService', () => {
  let service: CasesService;

  const prisma = {
    case: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    caseHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    family: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    familyMember: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    prisma.$transaction.mockImplementation(async (transaction) => {
      if (typeof transaction === 'function') {
        return transaction({
          case: prisma.case,
          caseHistory: prisma.caseHistory,
          family: prisma.family,
          familyMember: prisma.familyMember,
        });
      }

      return Promise.all(transaction);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [CasesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CasesService>(CasesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('links to the explicitly chosen family without creating a new one', async () => {
    prisma.family.findUnique.mockResolvedValue({ id: 'family-1' });
    prisma.family.update.mockResolvedValue({ id: 'family-1' });
    prisma.case.create.mockResolvedValue({
      id: 'case-1',
      familyId: 'family-1',
    });
    prisma.caseHistory.create.mockResolvedValue({ id: 'history-1' });

    await service.create({
      applicantName: 'Test User',
      caseType: 'دعم',
      familyId: 'family-1',
    });

    expect(prisma.family.findUnique).toHaveBeenCalledWith({
      where: { id: 'family-1' },
    });
    expect(prisma.family.create).not.toHaveBeenCalled();
    expect(prisma.case.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ familyId: 'family-1' }),
      }),
    );
  });

  it('refuses to create a case without an existing family', async () => {
    prisma.family.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ applicantName: 'No Family', caseType: 'دعم' }),
    ).rejects.toThrow('أنشئ ملف الأسرة أولًا');
    await expect(
      service.create({
        applicantName: 'Ghost Family',
        caseType: 'دعم',
        familyId: 'missing',
      }),
    ).rejects.toThrow('أنشئ ملف الأسرة أولًا');
    expect(prisma.family.create).not.toHaveBeenCalled();
    expect(prisma.case.create).not.toHaveBeenCalled();
  });

  it('syncs family members from the form into the family record', async () => {
    prisma.family.findUnique.mockResolvedValue({ id: 'family-1' });
    prisma.family.update.mockResolvedValue({ id: 'family-1' });
    prisma.familyMember.deleteMany.mockResolvedValue({ count: 0 });
    prisma.familyMember.createMany.mockResolvedValue({ count: 1 });
    prisma.case.create.mockResolvedValue({
      id: 'case-4',
      familyId: 'family-1',
    });
    prisma.caseHistory.create.mockResolvedValue({ id: 'history-4' });

    await service.create({
      applicantName: 'Head',
      caseType: 'دعم',
      familyId: 'family-1',
      formData: {
        person: { fullName: 'Head' },
        family: { members: [{ name: 'Child', relation: 'ابن' }] },
      },
    });

    expect(prisma.familyMember.deleteMany).toHaveBeenCalledWith({
      where: { familyId: 'family-1' },
    });
    expect(prisma.familyMember.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ name: 'Child', familyId: 'family-1' })],
    });
  });

  it('auto-links an unlinked case to a family on update', async () => {
    prisma.case.findUnique.mockResolvedValue({ familyId: null });
    prisma.family.findUnique.mockResolvedValue(null);
    prisma.family.create.mockResolvedValue({ id: 'auto-family' });
    prisma.case.update.mockResolvedValue({
      id: 'case-1',
      familyId: 'auto-family',
    });

    await service.update('case-1', { applicantName: 'Head' });

    expect(prisma.case.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'case-1' },
        data: expect.objectContaining({ familyId: 'auto-family' }),
      }),
    );
  });

  it('throws when updating a missing case', async () => {
    prisma.case.findUnique.mockResolvedValue(null);

    await expect(service.update('missing-case', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('refuses to raise «استكمال الأوراق» to the director', async () => {
    prisma.case.findUnique.mockResolvedValue({
      id: 'case-9',
      lifecycleStatus: 'DRAFT',
      decisionStatus: 'PENDING_DECISION',
      formData: { support: { specialistOpinion: 'استكمال الأوراق' } },
    });

    await expect(
      service.transition('case-9', 'REVIEW', 'PENDING_DECISION', 'review'),
    ).rejects.toThrow('قبل الرفع للمدير');
    expect(prisma.case.update).not.toHaveBeenCalled();
  });

  it('raises «موافقة» to the director', async () => {
    prisma.case.findUnique.mockResolvedValue({
      id: 'case-9',
      lifecycleStatus: 'DRAFT',
      decisionStatus: 'PENDING_DECISION',
      formData: { support: { specialistOpinion: 'موافقة' } },
    });
    prisma.case.update.mockResolvedValue({
      id: 'case-9',
      lifecycleStatus: 'REVIEW',
    });
    prisma.caseHistory.create.mockResolvedValue({});

    await expect(
      service.transition('case-9', 'REVIEW', 'PENDING_DECISION', 'review'),
    ).resolves.toMatchObject({ lifecycleStatus: 'REVIEW' });
  });
});
