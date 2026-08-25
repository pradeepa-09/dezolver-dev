import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPlatformSummary(): Promise<{
        colleges: {
            total: number;
            active: number;
            suspended: number;
        };
        users: {
            total: number;
            byRole: {
                superAdmin: number;
                admin: number;
                user: number;
            };
            active: number;
        };
        plans: {
            total: number;
        };
        subscriptions: {
            total: number;
            active: number;
        };
        recentActivity: {
            id: string;
            action: string;
            createdAt: Date;
            targetId: string | null;
            targetType: string | null;
            actor: {
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            } | null;
            metadata: import("@prisma/client/runtime/client").JsonValue;
        }[];
    }>;
}
