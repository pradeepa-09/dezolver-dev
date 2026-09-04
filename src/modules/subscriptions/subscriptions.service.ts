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

    // Validate Plan exists and is active
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const latestVersion = plan.versions[0];
    if (!latestVersion) {
      throw new NotFoundException('Plan version not found');
    }
    if (!plan.isActive) {
      throw new ConflictException('Plan is not active and cannot be purchased');
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

    const subscription = await this.prisma.subscription.create({
      data: {
        collegeId,
        planId,
        planVersionId: latestVersion.id,
        status: 'ACTIVE',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'SUBSCRIPTION_CREATED',
        actorId,
        targetId: subscription.id,
        targetType: 'Subscription',
        metadata: {
          collegeId,
          planId,
          planVersionId: latestVersion.id,
          status: 'ACTIVE',
        },
      },
    });

    return subscription;
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
        planVersionId: true,
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
        planVersion: {
          select: {
            id: true,
            version: true,
            pricingMode: true,
            price: true,
            currency: true,
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
        planVersionId: true,
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
        planVersion: {
          select: {
            id: true,
            version: true,
            pricingMode: true,
            price: true,
            currency: true,
            minSeats: true,
            maxSeats: true,
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

    let newPlanVersionId: string | undefined;

    if (updateDto.planId) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: updateDto.planId },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
      });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }
      if (!plan.isActive) {
        throw new ConflictException(
          'Plan is not active and cannot be purchased',
        );
      }
      const latestVersion = plan.versions[0];
      if (!latestVersion) {
        throw new NotFoundException('Plan version not found');
      }
      newPlanVersionId = latestVersion.id;
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

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        ...(updateDto.planId && {
          planId: updateDto.planId,
          planVersionId: newPlanVersionId,
        }),
        ...(updateDto.status && { status: updateDto.status }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'SUBSCRIPTION_UPDATED',
        actorId,
        targetId: subscription.id,
        targetType: 'Subscription',
        metadata: updateDto as Prisma.InputJsonValue,
      },
    });

    return updatedSubscription;
  }
}
