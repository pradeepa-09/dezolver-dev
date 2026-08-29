import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be defined in environment');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    role: string;
    collegeId?: string;
    isImpersonation?: boolean;
    impersonatorId?: string;
    targetCollegeId?: string;
    jti?: string;
  }) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    if (payload.isImpersonation && payload.jti) {
      const revoked = await this.prisma.auditLog.findFirst({
        where: {
          action: 'IMPERSONATION_ENDED',
          metadata: {
            path: ['jti'],
            equals: payload.jti,
          },
        },
      });
      if (revoked) {
        throw new UnauthorizedException('Impersonation session has been ended');
      }
    }

    return {
      id: payload.sub,
      role: payload.role,
      collegeId: payload.collegeId,
      isImpersonation: payload.isImpersonation,
      impersonatorId: payload.impersonatorId,
      targetCollegeId: payload.targetCollegeId,
      jti: payload.jti,
    };
  }
}
