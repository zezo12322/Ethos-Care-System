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
    prisma.case.create.mockResolvedValue({ id: 'case-1', familyId: 'family-1' });
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

  it('reuses an existing family with the same national ID instead of duplicating', async () => {
    prisma.family.findUnique.mockResolvedValue({ id: 'family-nid' });
    prisma.family.update.mockResolvedValue({ id: 'family-nid' });
    prisma.case.create.mockResolvedValue({ id: 'case-2', familyId: 'family-nid' });
    prisma.caseHistory.create.mockResolvedValue({ id: 'history-2' });

    await service.create({
      applicantName: 'Reused Head',
      nationalId: '12345678901234',
      caseType: 'دعم',
    });

    expect(prisma.family.findUnique).toHaveBeenCalledWith({
      where: { nationalId: '12345678901234' },
    });
    expect(prisma.family.create).not.toHaveBeenCalled();
    expect(prisma.case.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ familyId: 'family-nid' }),
      }),
    );
  });

  it('creates a new family when none matches so every case is linked', async () => {
    prisma.family.findUnique.mockResolvedValue(null);
    prisma.family.create.mockResolvedValue({ id: 'new-family' });
    prisma.case.create.mockResolvedValue({ id: 'case-3', familyId: 'new-family' });
    prisma.caseHistory.create.mockResolvedValue({ id: 'history-3' });

    await service.create({
      applicantName: 'Brand New',
      caseType: 'دعم',
    });

    expect(prisma.family.create).toHaveBeenCalled();
    expect(prisma.case.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ familyId: 'new-family' }),
      }),
    );
  });

  it('syncs family members from the form into the family record', async () => {
    prisma.family.findUnique.mockResolvedValue({ id: 'family-1' });
    prisma.family.update.mockResolvedValue({ id: 'family-1' });
    prisma.familyMember.deleteMany.mockResolvedValue({ count: 0 });
    prisma.familyMember.createMany.mockResolvedValue({ count: 1 });
    prisma.case.create.mockResolvedValue({ id: 'case-4', familyId: 'family-1' });
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
    prisma.case.update.mockResolvedValue({ id: 'case-1', familyId: 'auto-family' });

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
});
