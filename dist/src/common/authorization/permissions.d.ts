import { Role } from '@prisma/client';
export type Permission = 'system:test' | 'colleges:read' | 'colleges:create' | 'colleges:update' | 'colleges:manage_status' | 'colleges:impersonate';
export declare const RolePermissions: Record<Role, Permission[]>;
