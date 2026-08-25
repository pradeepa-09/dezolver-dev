import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

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

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = uuidv4();
    const tokenHash = this.hashToken(refreshToken);

    // Default to 7 days if not specified
    const refreshExpirationStr = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    const refreshExpirationMs = this.parseExpirationToMs(refreshExpirationStr);
    const expiresAt = new Date(Date.now() + refreshExpirationMs);

    // Store refresh session
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

    // Generate new tokens
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = uuidv4();
    const newTokenHash = this.hashToken(newRefreshToken);

    const refreshExpirationStr = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
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

  verifyOtp(verifyOtpDto: VerifyOtpDto) {
    // Stub implementation for Phase 4
    if (!verifyOtpDto) return;
    throw new InternalServerErrorException(
      'OTP verification is not fully implemented yet.',
    );
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpirationToMs(expiration: string): number {
    const match = expiration.match(/^(\d+)(d|h|m|s)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7d
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
