import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly cls: ClsService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: unknown,
    user: unknown,
    _info: unknown,
    _context: unknown,
    _status?: unknown,
  ): TUser {
    void _info;
    void _context;
    void _status;
    if (err) {
      if (err instanceof Error) throw err;
      throw new UnauthorizedException('Unauthorized');
    }
    if (!user) {
      throw new UnauthorizedException();
    }

    const u = user as {
      isImpersonation?: boolean;
      targetCollegeId?: string;
      collegeId?: string;
      id?: string;
      role?: string;
    };

    // Determine the active college context
    // If impersonating, the targetCollegeId takes precedence over the user's actual college
    const currentCollegeId =
      u.isImpersonation && u.targetCollegeId ? u.targetCollegeId : u.collegeId;

    this.cls.set('userId', u.id);
    this.cls.set('role', u.role);
    this.cls.set('collegeId', currentCollegeId);

    return user as TUser;
  }
}
