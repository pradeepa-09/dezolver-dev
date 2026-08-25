import { Role } from '@prisma/client';

export type Permission =
  | 'system:test'
  | 'colleges:read'
  | 'colleges:create'
  | 'colleges:update'
  | 'colleges:manage_status'
  | 'colleges:impersonate';

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    'system:test',
    'colleges:read',
    'colleges:create',
    'colleges:update',
    'colleges:manage_status',
    'colleges:impersonate',
  ],
  [Role.ADMIN]: [],
  [Role.USER]: [],
};
