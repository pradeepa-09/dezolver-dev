import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import type { Response, Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<{
        success: boolean;
        data: {
            mfaRequired: boolean;
            mfaToken: string;
            user: {
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            };
            accessToken?: undefined;
        };
    } | {
        success: boolean;
        data: {
            accessToken: string;
            user: {
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            };
            mfaRequired?: undefined;
            mfaToken?: undefined;
        };
    } | undefined>;
    verifyOtp(verifyOtpDto: VerifyOtpDto, req: Request, res: Response): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            user: {
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            };
        };
    }>;
    setupMfa(req: Request & {
        user?: {
            sub?: string;
            id?: string;
        };
    }): Promise<{
        secret: string;
        qrCode: string;
    }>;
    enableMfa(req: Request & {
        user?: {
            sub?: string;
            id?: string;
        };
    }, otpCode: string): Promise<{
        success: boolean;
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
        data: {
            accessToken: string;
        };
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
    }>;
}
