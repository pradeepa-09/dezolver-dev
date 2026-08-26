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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const verify_otp_dto_1 = require("./dto/verify-otp.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto, res) {
        const result = await this.authService.login(loginDto);
        if ('mfaRequired' in result && result.mfaRequired) {
            return {
                success: true,
                data: {
                    mfaRequired: true,
                    mfaToken: result.mfaToken,
                    user: result.user,
                },
            };
        }
        if ('refreshToken' in result) {
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: result.refreshExpirationMs,
                path: '/api/auth',
            });
            return {
                success: true,
                data: {
                    accessToken: result.accessToken,
                    user: result.user,
                },
            };
        }
    }
    async verifyOtp(verifyOtpDto, req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('MFA token is missing');
        }
        const mfaToken = authHeader.split(' ')[1];
        const result = await this.authService.verifyOtp(verifyOtpDto, mfaToken);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: result.refreshExpirationMs,
            path: '/api/auth',
        });
        return {
            success: true,
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        };
    }
    async setupMfa(req) {
        const userId = req.user?.sub || req.user?.id;
        return this.authService.setupMfa(userId);
    }
    async enableMfa(req, otpCode) {
        const userId = req.user?.sub || req.user?.id;
        return this.authService.enableMfa(userId, otpCode);
    }
    async refresh(req, res) {
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        const { accessToken, refreshToken: newRefreshToken, refreshExpirationMs, } = await this.authService.refresh(refreshToken);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshExpirationMs,
            path: '/api/auth',
        });
        return {
            success: true,
            data: {
                accessToken,
            },
        };
    }
    async logout(req, res) {
        const refreshToken = req.cookies['refreshToken'];
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }
        res.clearCookie('refreshToken', { path: '/api/auth' });
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('mfa/setup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setupMfa", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('mfa/enable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('otpCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enableMfa", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map