import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, actorId: string) {
    const { collegeId, planId } = createSubscriptionDto;

    // Validate College exists
    const college = await this.prisma.college.findUnique({
      where: { id: collegeId },
    });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    // Validate Plan exists
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Reject duplicate active subscription
    const existingActive = await this.prisma.subscription.findFirst({
      where: {
        collegeId,
        status: 'ACTIVE',
      },
    });
    if (existingActive) {
      throw new ConflictException('College already has an active subscription');
    }

    // Create inside a transaction
    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          collegeId,
          planId,
          status: 'ACTIVE',
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'SUBSCRIPTION_CREATED',
          actorId,
          targetId: subscription.id,
          targetType: 'Subscription',
          metadata: {
            collegeId,
            planId,
            status: 'ACTIVE',
          },
        },
      });

      return subscription;
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        collegeId: true,
        planId: true,
        college: {
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        collegeId: true,
        planId: true,
        college: {
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async update(id: string, updateDto: UpdateSubscriptionDto, actorId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (updateDto.planId) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: updateDto.planId },
      });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }
    }

    if (updateDto.status === 'ACTIVE' && subscription.status !== 'ACTIVE') {
      // Prevent multiple active subscriptions
      const existingActive = await this.prisma.subscription.findFirst({
        where: {
          collegeId: subscription.collegeId,
          status: 'ACTIVE',
          NOT: { id },
        },
      });
      if (existingActive) {
        throw new ConflictException(
          'College already has an active subscription',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          ...(updateDto.planId && { planId: updateDto.planId }),
          ...(updateDto.status && { status: updateDto.status }),
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'SUBSCRIPTION_UPDATED',
          actorId,
          targetId: subscription.id,
          targetType: 'Subscription',
          metadata: updateDto as Prisma.InputJsonValue,
        },
      });

      return updatedSubscription;
    });
  }
}
