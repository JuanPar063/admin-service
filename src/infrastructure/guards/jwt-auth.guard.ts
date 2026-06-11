import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Sin credenciales → 401 (antes devolvía false = 403).
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación ausente.');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
    request.user = payload; // { sub, username, role }

    // Enforcement del decorador @Roles('admin'): antes era decorativo (no se
    // verificaba), por lo que CUALQUIER usuario autenticado accedía al backoffice.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles && requiredRoles.length > 0) {
      if (!payload?.role || !requiredRoles.includes(payload.role)) {
        throw new ForbiddenException(
          'No tienes permisos suficientes para este recurso.',
        );
      }
    }

    return true;
  }
}
