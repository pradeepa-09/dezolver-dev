import { ExecutionContext } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private readonly cls;
    constructor(cls: ClsService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest<TUser = any>(err: unknown, user: unknown, _info: unknown, _context: unknown, _status?: unknown): TUser;
}
export {};
