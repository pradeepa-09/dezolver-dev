import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

const mockPlansService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
};

describe('PlansController', () => {
  let controller: PlansController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        {
          provide: PlansService,
          useValue: mockPlansService,
        },
      ],
    }).compile();

    controller = module.get<PlansController>(PlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with user id from req', async () => {
    const dto: any = { name: 'Starter', description: 'Base plan', price: 1000 };
    const req = { user: { id: 'admin-id' } };
    mockPlansService.create.mockResolvedValue({ id: 'p1', ...dto });

    const result = await controller.create(dto, req);
    expect(mockPlansService.create).toHaveBeenCalledWith(dto, 'admin-id');
    expect(result).toEqual({ id: 'p1', ...dto });
  });

  it('should call service.findAll', async () => {
    mockPlansService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(mockPlansService.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should call service.findOne with id', async () => {
    mockPlansService.findOne.mockResolvedValue({ id: 'p1', name: 'Starter' });
    const result = await controller.findOne('p1');
    expect(mockPlansService.findOne).toHaveBeenCalledWith('p1');
    expect(result).toEqual({ id: 'p1', name: 'Starter' });
  });

  it('should call service.update with id, dto, and actor id', async () => {
    const dto = { name: 'Starter Updated' };
    const req = { user: { id: 'admin-id' } };
    mockPlansService.update.mockResolvedValue({ id: 'p1', ...dto });

    const result = await controller.update('p1', dto, req);
    expect(mockPlansService.update).toHaveBeenCalledWith('p1', dto, 'admin-id');
    expect(result).toEqual({ id: 'p1', ...dto });
  });

  it('should call service.updateStatus with id, isActive, and actor id', async () => {
    const dto = { isActive: false };
    const req = { user: { id: 'admin-id' } };
    mockPlansService.updateStatus.mockResolvedValue({
      id: 'p1',
      isActive: false,
    });

    const result = await controller.updateStatus('p1', dto, req);
    expect(mockPlansService.updateStatus).toHaveBeenCalledWith(
      'p1',
      false,
      'admin-id',
    );
    expect(result).toEqual({ id: 'p1', isActive: false });
  });
});
