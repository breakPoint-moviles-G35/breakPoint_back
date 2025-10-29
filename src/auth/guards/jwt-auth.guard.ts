import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Puedes agregar lógica extra si lo necesitas
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      console.error('[JwtAuthGuard] Unauthorized - no user found or invalid token');
      throw err || new Error('Unauthorized');
    }
    console.log('[JwtAuthGuard] User validated:', user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}