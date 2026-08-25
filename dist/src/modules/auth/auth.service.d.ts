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
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        refreshExpirationMs: number;
    }>;
    refresh(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        refreshExpirationMs: number;
    }>;
    logout(refreshToken: string): Promise<void>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): void;
    private hashToken;
    private parseExpirationToMs;
}
