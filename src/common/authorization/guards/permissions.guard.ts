import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { Permission, RolePermissions } from '../permissions';
import { Role } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    const user = request.user;

    // Note: If request.user is completely missing, the JwtAuthGuard should have blocked it.
    // But if they are somehow missing role, we block them.
    if (!user || !user.role) {
      throw new ForbiddenException({
        success: false,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      });
    }

    const userRole = user.role as Role;
    const userPermissions = RolePermissions[userRole] || [];

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        success: false,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      });
    }

    return true;
  }
}
