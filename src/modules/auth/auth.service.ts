import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.mfaEnabled) {
      // Issue a temporary token for MFA verification
      const mfaTokenPayload = {
        sub: user.id,
        role: user.role,
        collegeId: user.collegeId,
        isMfaTemp: true,
      };
      const mfaToken = this.jwtService.sign(mfaTokenPayload, {
        expiresIn: '5m',
      });

      return {
        mfaRequired: true,
        mfaToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }

    return this.generateTokensAndSession(user);
  }

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Dezolver', secret);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCode: qrCodeDataUrl,
    };
  }

  async enableMfa(userId: string, otpCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    const isValid = authenticator.verify({
      token: otpCode,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { success: true };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, mfaToken: string) {
    let payload: { isMfaTemp?: boolean; sub?: string };
    try {
      payload = this.jwtService.verify(mfaToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired MFA token');
    }

    if (!payload.isMfaTemp || payload.sub !== verifyOtpDto.userId) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: verifyOtpDto.userId },
      include: { college: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException('MFA is not enabled for this user');
    }

    const isValid = authenticator.verify({
      token: verifyOtpDto.otpCode,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    return this.generateTokensAndSession(user);
  }

  private async generateTokensAndSession(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
      collegeId: user.collegeId,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    const tokenHash = this.hashToken(refreshToken);

    const refreshExpirationStr = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
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

  async refresh(oldRefreshToken: string) {
    const tokenHash = this.hashToken(oldRefreshToken);

    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.refreshSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = session.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Revoke old session
    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    return this.generateTokensAndSession(user);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    try {
      await this.prisma.refreshSession.updateMany({
        where: { tokenHash, isRevoked: false },
        data: { isRevoked: true },
      });
    } catch {
      // Ignore errors on logout
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpirationToMs(expiration: string): number {
    const match = expiration.match(/^(\d+)(d|h|m|s)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
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
}
