import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('looks up emails case-insensitively', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await service.findByEmail('Worker@Test.com');

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: {
          equals: 'worker@test.com',
          mode: 'insensitive',
        },
      },
    });
  });

  it('stores new emails in lowercase', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'worker@test.com',
      name: 'Worker',
      role: 'CASE_WORKER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.create({
      email: 'Worker@Test.com',
      password: 'secret123',
      name: 'Worker',
      role: 'CASE_WORKER',
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'worker@test.com',
        }),
      }),
    );
  });

  it('rejects duplicate emails regardless of letter case', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'existing-user',
      email: 'worker@test.com',
    });

    await expect(
      service.create({
        email: 'Worker@Test.com',
        password: 'secret123',
        name: 'Worker',
        role: 'CASE_WORKER',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
