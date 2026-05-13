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
      update: jest.fn(),
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

  it('updates lastVisit when creating a case linked to a family', async () => {
    prisma.case.create.mockResolvedValue({ id: 'case-1' });
    prisma.caseHistory.create.mockResolvedValue({ id: 'history-1' });
    prisma.family.update.mockResolvedValue({ id: 'family-1' });

    await service.create({
      applicantName: 'Test User',
      caseType: 'دعم',
      familyId: 'family-1',
    });

    expect(prisma.family.update).toHaveBeenCalledWith({
      where: { id: 'family-1' },
      data: { lastVisit: expect.any(Date) },
    });
  });

  it('updates lastVisit when linking a case to a different family', async () => {
    prisma.case.findUnique.mockResolvedValue({ familyId: null });
    prisma.case.update.mockResolvedValue({
      id: 'case-1',
      familyId: 'family-1',
    });
    prisma.family.update.mockResolvedValue({ id: 'family-1' });

    await service.update('case-1', { familyId: 'family-1' });

    expect(prisma.family.update).toHaveBeenCalledWith({
      where: { id: 'family-1' },
      data: { lastVisit: expect.any(Date) },
    });
  });

  it('does not touch lastVisit when the linked family has not changed', async () => {
    prisma.case.findUnique.mockResolvedValue({ familyId: 'family-1' });
    prisma.case.update.mockResolvedValue({
      id: 'case-1',
      familyId: 'family-1',
    });

    await service.update('case-1', { familyId: 'family-1' });

    expect(prisma.family.update).not.toHaveBeenCalled();
  });

  it('throws when updating a missing case', async () => {
    prisma.case.findUnique.mockResolvedValue(null);

    await expect(service.update('missing-case', {})).rejects.toThrow(
      NotFoundException,
    );
  });
});
