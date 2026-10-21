import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  function createMockContext(role?: string): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: role ? { role } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext('viewer');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when roles are an empty array', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockContext('viewer');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'analyst']);
    const context = createMockContext('admin');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user role is not in required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockContext('viewer');

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user is not authenticated', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow analyst access to admin+analyst endpoints', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'analyst']);
    const context = createMockContext('analyst');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny viewer access to admin+analyst endpoints', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'analyst']);
    const context = createMockContext('viewer');

    expect(guard.canActivate(context)).toBe(false);
  });
});
