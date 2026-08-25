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
        },
      },
    });

    return plan;
  }

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
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
    const plan = await this.prisma.plan.findUnique({ where: { id } });
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

    const updatedPlan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(updatePlanDto.name && { name: updatePlanDto.name.trim() }),
        ...(updatePlanDto.description !== undefined && {
          description: updatePlanDto.description?.trim() || null,
        }),
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

    return updatedPlan;
  }
}
