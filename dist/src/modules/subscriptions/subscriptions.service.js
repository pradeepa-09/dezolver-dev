"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSubscriptionDto, actorId) {
        const { collegeId, planId } = createSubscriptionDto;
        const college = await this.prisma.college.findUnique({
            where: { id: collegeId },
        });
        if (!college) {
            throw new common_1.NotFoundException('College not found');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plan not found');
        }
        const existingActive = await this.prisma.subscription.findFirst({
            where: {
                collegeId,
                status: 'ACTIVE',
            },
        });
        if (existingActive) {
            throw new common_1.ConflictException('College already has an active subscription');
        }
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Subscription not found');
        }
        return subscription;
    }
    async update(id, updateDto, actorId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (updateDto.planId) {
            const plan = await this.prisma.plan.findUnique({
                where: { id: updateDto.planId },
            });
            if (!plan) {
                throw new common_1.NotFoundException('Plan not found');
            }
        }
        if (updateDto.status === 'ACTIVE' && subscription.status !== 'ACTIVE') {
            const existingActive = await this.prisma.subscription.findFirst({
                where: {
                    collegeId: subscription.collegeId,
                    status: 'ACTIVE',
                    NOT: { id },
                },
            });
            if (existingActive) {
                throw new common_1.ConflictException('College already has an active subscription');
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
                    metadata: updateDto,
                },
            });
            return updatedSubscription;
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map