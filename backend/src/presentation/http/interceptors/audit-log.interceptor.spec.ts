import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditLogInterceptor } from './audit-log.interceptor';

type MockRequest = {
  method: string;
  path: string;
  user?: {
    id?: string;
    email?: string;
    role?: string;
    workspaceId?: string;
  };
};

function createContext(request: MockRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuditLogInterceptor', () => {
  it('logs audit events for mutating requests', (done) => {
    const interceptor = new AuditLogInterceptor();
    const request: MockRequest = {
      method: 'POST',
      path: '/api/personas',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'admin',
        workspaceId: 'ws-1',
      },
    };
    const context = createContext(request);
    const next: CallHandler = { handle: () => of({}) };
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('"event":"audit"'),
        );
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('"method":"POST"'),
        );
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('"userId":"user-1"'),
        );
        done();
      },
    });
  });

  it('skips audit logging for GET requests', (done) => {
    const interceptor = new AuditLogInterceptor();
    const request: MockRequest = {
      method: 'GET',
      path: '/api/personas',
    };
    const context = createContext(request);
    const next: CallHandler = { handle: () => of({}) };
    const logSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(logSpy).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('logs audit errors for failed mutating requests', (done) => {
    const interceptor = new AuditLogInterceptor();
    const request: MockRequest = {
      method: 'DELETE',
      path: '/api/personas/1',
    };
    const context = createContext(request);
    const next: CallHandler = {
      handle: () => throwError(() => new Error('boom')),
    };
    const warnSpy = jest.spyOn(interceptor['logger'], 'warn');

    interceptor.intercept(context, next).subscribe({
      error: () => {
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('"status":"error"'),
        );
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('boom'));
        done();
      },
    });
  });
});
