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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlatformSummary() {
        const [totalColleges, activeColleges, suspendedColleges, totalUsers, superAdminCount, adminCount, userRoleCount, activeUsers, totalPlans, totalSubscriptions, activeSubscriptions, recentAuditLogs,] = await Promise.all([
            this.prisma.college.count(),
            this.prisma.college.count({ where: { status: 'ACTIVE' } }),
            this.prisma.college.count({ where: { status: 'SUSPENDED' } }),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
            this.prisma.user.count({ where: { role: 'USER' } }),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.plan.count(),
            this.prisma.subscription.count(),
            this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            this.prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    action: true,
                    createdAt: true,
                    targetId: true,
                    targetType: true,
                    metadata: true,
                    actor: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
        ]);
        const safeActivity = recentAuditLogs.map((log) => ({
            id: log.id,
            action: log.action,
            createdAt: log.createdAt,
            targetId: log.targetId,
            targetType: log.targetType,
            actor: log.actor
                ? {
                    id: log.actor.id,
                    email: log.actor.email,
                    role: log.actor.role,
                }
                : null,
            metadata: log.metadata,
        }));
        return {
            colleges: {
                total: totalColleges,
                active: activeColleges,
                suspended: suspendedColleges,
            },
            users: {
                total: totalUsers,
                byRole: {
                    superAdmin: superAdminCount,
                    admin: adminCount,
                    user: userRoleCount,
                },
                active: activeUsers,
            },
            plans: {
                total: totalPlans,
            },
            subscriptions: {
                total: totalSubscriptions,
                active: activeSubscriptions,
            },
            recentActivity: safeActivity,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map