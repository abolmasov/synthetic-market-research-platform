import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url } = request;
    const userAgent = request.get('user-agent') || '';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = response.statusCode;

        // Structured log format for Cloud Logging
        const logPayload = {
          message: `${method} ${url} ${statusCode} - ${duration}ms`,
          httpRequest: {
            requestMethod: method,
            requestUrl: url,
            status: statusCode,
            userAgent: userAgent,
            latency: `${duration / 1000}s`,
          },
          context: 'HttpRequest',
        };

        if (statusCode >= 500) {
          this.logger.error(logPayload);
        } else if (statusCode >= 400) {
          this.logger.warn(logPayload);
        } else {
          this.logger.log(logPayload);
        }
      }),
    );
  }
}
