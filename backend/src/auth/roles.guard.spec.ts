import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@sost/shared';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  function contextWithRole(role?: UserRole): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { role } : undefined }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows when no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(contextWithRole(UserRole.Viewer))).toBe(true);
  });

  it('allows matching role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      UserRole.Editor,
      UserRole.Admin,
    ]);
    expect(guard.canActivate(contextWithRole(UserRole.Editor))).toBe(true);
  });

  it('denies non-matching role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([UserRole.Admin]);
    expect(guard.canActivate(contextWithRole(UserRole.Viewer))).toBe(false);
  });
});
