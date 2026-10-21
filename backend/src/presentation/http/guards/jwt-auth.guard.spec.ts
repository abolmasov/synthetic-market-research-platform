import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createMockContext(): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    } as unknown as ExecutionContext;
  }

  it('allows access immediately for @Public routes', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    const parentCanActivateSpy = jest.spyOn(
      Object.getPrototypeOf(JwtAuthGuard.prototype),
      'canActivate',
    );

    expect(guard.canActivate(context)).toBe(true);
    expect(parentCanActivateSpy).not.toHaveBeenCalled();
  });

  it('delegates to passport auth guard for protected routes', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext();

    const parentCanActivateSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
    expect(parentCanActivateSpy).toHaveBeenCalledWith(context);
  });
});
