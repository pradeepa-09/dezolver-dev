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
            accessToken: string;
            user: {
                id: string;
                email: string;
                role: import("@prisma/client").$Enums.Role;
            };
        };
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
    verifyOtp(verifyOtpDto: VerifyOtpDto): void;
}
