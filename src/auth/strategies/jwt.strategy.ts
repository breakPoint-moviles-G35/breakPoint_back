/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtFromRequestFunction } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;
  email: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    // Tipado explícito del extractor
    const jwtFromAuthHeader: JwtFromRequestFunction = ExtractJwt.fromAuthHeaderAsBearerToken();

    const secret = cfg.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    super({
      jwtFromRequest: jwtFromAuthHeader,
      secretOrKey: secret,
    });
  }

  // 2) No uses async si no haces await
  validate(payload: JwtPayload) {
    // Log mínimo del payload (sin exponer el token completo)
    // eslint-disable-next-line no-console
    console.log('[JWT] validate payload', { sub: payload.sub, email: payload.email, role: payload.role });
    return { id: payload.sub, email: payload.email, role: payload.role ?? 'user' };
  }
}
