import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
      // Set standard refresh cookie if MFA not required
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

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('MFA token is missing');
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

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  async setupMfa(
    @Req() req: Request & { user?: { sub?: string; id?: string } },
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.authService.setupMfa(userId as string);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  async enableMfa(
    @Req() req: Request & { user?: { sub?: string; id?: string } },
    @Body('otpCode') otpCode: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.authService.enableMfa(userId as string, otpCode);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'] as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      refreshExpirationMs,
    } = await this.authService.refresh(refreshToken);

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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'] as string;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });

    return { success: true };
  }
}
