import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtFromRequestFunction } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string; 
  email: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    const jwtFromAuthHeader: JwtFromRequestFunction =
      ExtractJwt.fromAuthHeaderAsBearerToken();

    const secret = cfg.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    super({
      jwtFromRequest: jwtFromAuthHeader,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    console.log('[JWT] Payload recibido:', payload);

    return {
      id: payload.sub, // UUID del usuario
      email: payload.email,
      role: payload.role ?? 'user',
    };
  }
}