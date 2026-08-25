"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = void 0;
const client_1 = require("@prisma/client");
exports.RolePermissions = {
    [client_1.Role.SUPER_ADMIN]: [
        'system:test',
        'colleges:read',
        'colleges:create',
        'colleges:update',
        'colleges:manage_status',
        'colleges:impersonate',
    ],
    [client_1.Role.ADMIN]: [],
    [client_1.Role.USER]: [],
};
//# sourceMappingURL=permissions.js.map