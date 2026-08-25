import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformSummary() {
    const [
      totalColleges,
      activeColleges,
      suspendedColleges,
      totalUsers,
      superAdminCount,
      adminCount,
      userRoleCount,
      activeUsers,
      totalPlans,
      totalSubscriptions,
      activeSubscriptions,
      recentAuditLogs,
    ] = await Promise.all([
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

    // Format safe audit activity without confidential data
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
}
