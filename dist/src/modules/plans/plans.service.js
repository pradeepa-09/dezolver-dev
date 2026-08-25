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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PlansService = class PlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPlanDto, actorId) {
        const existing = await this.prisma.plan.findFirst({
            where: {
                name: {
                    equals: createPlanDto.name,
                    mode: 'insensitive',
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Plan with this name already exists');
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Plan not found');
        }
        return plan;
    }
    async update(id, updatePlanDto, actorId) {
        const plan = await this.prisma.plan.findUnique({ where: { id } });
        if (!plan) {
            throw new common_1.NotFoundException('Plan not found');
        }
        if (updatePlanDto.name &&
            updatePlanDto.name.trim().toLowerCase() !== plan.name.toLowerCase()) {
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
                throw new common_1.ConflictException('Plan with this name already exists');
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
                metadata: updatePlanDto,
            },
        });
        return updatedPlan;
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlansService);
//# sourceMappingURL=plans.service.js.map