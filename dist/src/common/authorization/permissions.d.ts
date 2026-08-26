import { Role } from '@prisma/client';
export type Permission = 'system:test' | 'colleges:read' | 'colleges:create' | 'colleges:update' | 'colleges:manage_status' | 'colleges:impersonate' | 'plans:read' | 'plans:create' | 'plans:update' | 'plans:manage_status' | 'analytics:read' | 'subscriptions:read' | 'subscriptions:create' | 'subscriptions:update';
export declare const RolePermissions: Record<Role, Permission[]>;
