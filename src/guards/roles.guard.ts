import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 🔹 No roles specified → allow access
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.currentUser; // set by AuthGuard

    if (!user) return false;
    return requiredRoles.includes(user.role);
  }
}
