"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    usersService;
    prisma;
    jwtService;
    configService;
    constructor(usersService, prisma, jwtService, configService) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const payload = { sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = (0, uuid_1.v4)();
        const tokenHash = this.hashToken(refreshToken);
        const refreshExpirationStr = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
        const refreshExpirationMs = this.parseExpirationToMs(refreshExpirationStr);
        const expiresAt = new Date(Date.now() + refreshExpirationMs);
        await this.prisma.refreshSession.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            refreshExpirationMs,
        };
    }
    async refresh(oldRefreshToken) {
        const tokenHash = this.hashToken(oldRefreshToken);
        const session = await this.prisma.refreshSession.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!session || session.isRevoked) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (session.expiresAt < new Date()) {
            await this.prisma.refreshSession.update({
                where: { id: session.id },
                data: { isRevoked: true },
            });
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const user = session.user;
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        await this.prisma.refreshSession.update({
            where: { id: session.id },
            data: { isRevoked: true },
        });
        const payload = { sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const newRefreshToken = (0, uuid_1.v4)();
        const newTokenHash = this.hashToken(newRefreshToken);
        const refreshExpirationStr = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
        const refreshExpirationMs = this.parseExpirationToMs(refreshExpirationStr);
        const expiresAt = new Date(Date.now() + refreshExpirationMs);
        await this.prisma.refreshSession.create({
            data: {
                userId: user.id,
                tokenHash: newTokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
            refreshExpirationMs,
        };
    }
    async logout(refreshToken) {
        if (!refreshToken)
            return;
        const tokenHash = this.hashToken(refreshToken);
        try {
            await this.prisma.refreshSession.updateMany({
                where: { tokenHash, isRevoked: false },
                data: { isRevoked: true },
            });
        }
        catch {
        }
    }
    verifyOtp(verifyOtpDto) {
        if (!verifyOtpDto)
            return;
        throw new common_1.InternalServerErrorException('OTP verification is not fully implemented yet.');
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    parseExpirationToMs(expiration) {
        const match = expiration.match(/^(\d+)(d|h|m|s)$/);
        if (!match)
            return 7 * 24 * 60 * 60 * 1000;
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'm':
                return value * 60 * 1000;
            case 's':
                return value * 1000;
            default:
                return 7 * 24 * 60 * 60 * 1000;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map