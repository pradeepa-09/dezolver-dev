import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './modules/prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: { $queryRaw: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status', () => {
      expect(appController.getHello()).toEqual({
        message: 'Dezolver API is running',
      });
    });
  });
});
