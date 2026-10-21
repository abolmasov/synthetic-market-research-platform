import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggerInterceptor } from './logger.interceptor';

type MockRequest = {
  method: string;
  url: string;
  get: jest.MockedFunction<(name: string) => string | undefined>;
};

type MockResponse = {
  statusCode: number;
};

function createContext(
  request: MockRequest,
  response: MockResponse,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

describe('LoggerInterceptor', () => {
  it('logs successful requests', (done) => {
    const interceptor = new LoggerInterceptor();
    const request: MockRequest = {
      method: 'GET',
      url: '/api/test',
      get: jest.fn().mockReturnValue('test-agent'),
    };
    const response: MockResponse = { statusCode: 200 };
    const context = createContext(request, response);
    const next: CallHandler = { handle: () => of({}) };
    const loggerSpy = jest.spyOn(interceptor['logger'], 'log');

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        const [payload] = loggerSpy.mock.calls[0] as [
          {
            message: string;
          },
        ];
        expect(payload.message).toContain('GET /api/test 200');
        done();
      },
    });
  });

  it('logs warnings for 4xx responses', (done) => {
    const interceptor = new LoggerInterceptor();
    const request: MockRequest = {
      method: 'GET',
      url: '/api/test',
      get: jest.fn().mockReturnValue('test-agent'),
    };
    const response: MockResponse = { statusCode: 404 };
    const context = createContext(request, response);
    const next: CallHandler = { handle: () => of({}) };
    const warnSpy = jest.spyOn(interceptor['logger'], 'warn');

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(warnSpy).toHaveBeenCalled();
        done();
      },
    });
  });

  it('logs errors for 5xx responses', (done) => {
    const interceptor = new LoggerInterceptor();
    const request: MockRequest = {
      method: 'GET',
      url: '/api/test',
      get: jest.fn().mockReturnValue(undefined),
    };
    const response: MockResponse = { statusCode: 500 };
    const context = createContext(request, response);
    const next: CallHandler = { handle: () => of({}) };
    const errorSpy = jest.spyOn(interceptor['logger'], 'error');

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(errorSpy).toHaveBeenCalled();
        done();
      },
    });
  });
});
