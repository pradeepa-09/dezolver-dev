import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
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

  validate(payload: {
    sub: string;
    role: string;
    collegeId?: string;
    isImpersonation?: boolean;
    impersonatorId?: string;
    targetCollegeId?: string;
  }) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return {
      id: payload.sub,
      role: payload.role,
      collegeId: payload.collegeId,
      isImpersonation: payload.isImpersonation,
      impersonatorId: payload.impersonatorId,
      targetCollegeId: payload.targetCollegeId,
    };
  }
}
