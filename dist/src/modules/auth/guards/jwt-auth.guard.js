"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const nestjs_cls_1 = require("nestjs-cls");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    cls;
    constructor(cls) {
        super();
        this.cls = cls;
    }
    canActivate(context) {
        return super.canActivate(context);
    }
    handleRequest(err, user, _info, _context, _status) {
        void _info;
        void _context;
        void _status;
        if (err) {
            if (err instanceof Error)
                throw err;
            throw new common_1.UnauthorizedException('Unauthorized');
        }
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        const u = user;
        const currentCollegeId = u.isImpersonation && u.targetCollegeId ? u.targetCollegeId : u.collegeId;
        this.cls.set('userId', u.id);
        this.cls.set('role', u.role);
        this.cls.set('collegeId', currentCollegeId);
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_cls_1.ClsService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map