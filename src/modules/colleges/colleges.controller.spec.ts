import { Test, TestingModule } from '@nestjs/testing';
import { CollegesController } from './colleges.controller';
import { CollegesService } from './colleges.service';

import { ThrottlerGuard } from '@nestjs/throttler';

const mockCollegesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  suspend: jest.fn(),
  reactivate: jest.fn(),
  impersonate: jest.fn(),
  impersonateStop: jest.fn(),
};

describe('CollegesController', () => {
  let controller: CollegesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollegesController],
      providers: [
        {
          provide: CollegesService,
          useValue: mockCollegesService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CollegesController>(CollegesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
