import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto, actorId: string) {
    const existing = await this.prisma.plan.findFirst({
      where: {
        name: {
          equals: createPlanDto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException('Plan with this name already exists');
    }

    const plan = await this.prisma.plan.create({
      data: {
        name: createPlanDto.name.trim(),
        description: createPlanDto.description?.trim(),
        versions: {
          create: {
            version: 1,
            pricingMode: createPlanDto.pricingMode || 'AUTOMATIC',
            price: createPlanDto.price,
            currency: createPlanDto.currency || 'INR',
            minSeats: createPlanDto.minSeats,
            maxSeats: createPlanDto.maxSeats,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'PLAN_CREATED',
        actorId,
        targetId: plan.id,
        targetType: 'Plan',
        metadata: {
          name: plan.name,
          description: plan.description,
          pricingMode: plan.versions[0].pricingMode,
          price: plan.versions[0].price,
          currency: plan.versions[0].currency,
          minSeats: plan.versions[0].minSeats,
          maxSeats: plan.versions[0].maxSeats,
        },
      },
    });

    return plan;
  }

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
        subscriptions: {
          include: {
            college: {
              select: {
                id: true,
                name: true,
                domain: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto, actorId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (
      updatePlanDto.name &&
      updatePlanDto.name.trim().toLowerCase() !== plan.name.toLowerCase()
    ) {
      const existing = await this.prisma.plan.findFirst({
        where: {
          name: {
            equals: updatePlanDto.name.trim(),
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    let newVersionCreated = false;
    let nextVersionNum = 1;
    const latestVersion = plan.versions[0];
    
    const priceHasChanged =
      updatePlanDto.price !== undefined &&
      updatePlanDto.price !== latestVersion?.price;
    const pricingModeHasChanged =
      updatePlanDto.pricingMode !== undefined &&
      updatePlanDto.pricingMode !== latestVersion?.pricingMode;
    const currencyHasChanged =
      updatePlanDto.currency !== undefined &&
      updatePlanDto.currency !== latestVersion?.currency;

    const minSeatsParam =
      updatePlanDto.minSeats !== undefined ? updatePlanDto.minSeats : null;
    const minSeatsHasChanged =
      updatePlanDto.minSeats !== undefined &&
      minSeatsParam !== latestVersion?.minSeats;

    const maxSeatsParam =
      updatePlanDto.maxSeats !== undefined ? updatePlanDto.maxSeats : null;
    const maxSeatsHasChanged =
      updatePlanDto.maxSeats !== undefined &&
      maxSeatsParam !== latestVersion?.maxSeats;

    if (
      priceHasChanged ||
      pricingModeHasChanged ||
      currencyHasChanged ||
      minSeatsHasChanged ||
      maxSeatsHasChanged
    ) {
      nextVersionNum = latestVersion ? latestVersion.version + 1 : 1;
      newVersionCreated = true;
    }

    const updatedPlan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(updatePlanDto.name && { name: updatePlanDto.name.trim() }),
        ...(updatePlanDto.description !== undefined && {
          description: updatePlanDto.description?.trim() || null,
        }),
        ...(newVersionCreated && {
          versions: {
            create: {
              version: nextVersionNum,
              pricingMode:
                updatePlanDto.pricingMode ??
                latestVersion?.pricingMode ??
                'AUTOMATIC',
              price: updatePlanDto.price ?? latestVersion?.price ?? 0,
              currency:
                updatePlanDto.currency ?? latestVersion?.currency ?? 'INR',
              minSeats:
                updatePlanDto.minSeats !== undefined
                  ? updatePlanDto.minSeats
                  : latestVersion?.minSeats,
              maxSeats:
                updatePlanDto.maxSeats !== undefined
                  ? updatePlanDto.maxSeats
                  : latestVersion?.maxSeats,
            },
          },
        }),
      },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'PLAN_UPDATED',
        actorId,
        targetId: plan.id,
        targetType: 'Plan',
        metadata: updatePlanDto as Prisma.InputJsonValue,
      },
    });

    if (newVersionCreated) {
      await this.prisma.auditLog.create({
        data: {
          action: 'PLAN_VERSION_CREATED',
          actorId,
          targetId: plan.id,
          targetType: 'Plan',
          metadata: {
            newVersion: true,
            changes: updatePlanDto as Prisma.InputJsonValue,
          },
        },
      });
    }

    return updatedPlan;
  }

  async updateStatus(id: string, isActive: boolean, actorId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.isActive === isActive) {
      return plan;
    }

    const updatedPlan = await this.prisma.plan.update({
      where: { id },
      data: { isActive },
    });

    await this.prisma.auditLog.create({
      data: {
        action: isActive ? 'PLAN_ACTIVATED' : 'PLAN_DEACTIVATED',
        actorId,
        targetId: plan.id,
        targetType: 'Plan',
        metadata: { isActive },
      },
    });

    return updatedPlan;
  }
}
