import { Test, TestingModule } from '@nestjs/testing';
import { CollegesService } from './colleges.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

const mockPrismaService = {
  college: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

mockPrismaService.$transaction.mockImplementation(
  (cb: (arg: typeof mockPrismaService) => unknown) => cb(mockPrismaService),
);

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('CollegesService', () => {
  let service: CollegesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollegesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<CollegesService>(CollegesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
