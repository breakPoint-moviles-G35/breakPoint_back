/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true; // ruta sin restricción

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role?: string };
    if (!user?.role) throw new ForbiddenException('No role on user');

    // compara contra la lista permitida
    const ok = required.includes(user.role);
    if (!ok) throw new ForbiddenException('No se puede acceder con ese rol');
    return true;
  }
}
