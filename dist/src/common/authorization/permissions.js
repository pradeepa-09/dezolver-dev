"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = void 0;
const client_1 = require("@prisma/client");
exports.RolePermissions = {
    [client_1.Role.SUPER_ADMIN]: [
        'system:test',
        'colleges:list',
        'colleges:read',
        'colleges:create',
        'colleges:update',
        'colleges:manage_status',
        'colleges:impersonate',
        'plans:read',
        'plans:create',
        'plans:update',
        'plans:manage_status',
        'analytics:read',
        'subscriptions:read',
        'subscriptions:create',
        'subscriptions:update',
    ],
    [client_1.Role.ADMIN]: ['colleges:read'],
    [client_1.Role.USER]: [],
};
//# sourceMappingURL=permissions.js.map