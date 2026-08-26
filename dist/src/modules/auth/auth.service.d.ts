import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        refreshExpirationMs: number;
    } | {
        mfaRequired: boolean;
        mfaToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    setupMfa(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    enableMfa(userId: string, otpCode: string): Promise<{
        success: boolean;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto, mfaToken: string): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        refreshExpirationMs: number;
    }>;
    private generateTokensAndSession;
    refresh(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        refreshExpirationMs: number;
    }>;
    logout(refreshToken: string): Promise<void>;
    private hashToken;
    private parseExpirationToMs;
}
