import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@sost/shared';

export type AuthUser = {
  userId: string;
  username: string;
  role: UserRole;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
