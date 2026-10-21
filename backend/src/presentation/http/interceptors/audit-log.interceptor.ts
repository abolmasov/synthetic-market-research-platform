import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';

type AuditUser = {
  id?: string;
  email?: string;
  role?: string;
  workspaceId?: string;
};

/** HTTP methods that mutate state and should be audited. */
const MUTABLE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * Logs destructive / mutating requests for audit purposes.
 * Emits a single structured log line per request on completion.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();

    if (!MUTABLE_METHODS.has(req.method)) {
      return next.handle();
    }

    const user = (req as Request & { user?: AuditUser }).user;
    const startMs = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            JSON.stringify({
              event: 'audit',
              method: req.method,
              path: req.path,
              userId: user?.id ?? 'anonymous',
              userEmail: user?.email ?? 'anonymous',
              role: user?.role ?? 'unknown',
              workspaceId: user?.workspaceId ?? null,
              durationMs: Date.now() - startMs,
              status: 'success',
            }),
          );
        },
        error: (err: Error) => {
          this.logger.warn(
            JSON.stringify({
              event: 'audit',
              method: req.method,
              path: req.path,
              userId: user?.id ?? 'anonymous',
              userEmail: user?.email ?? 'anonymous',
              role: user?.role ?? 'unknown',
              workspaceId: user?.workspaceId ?? null,
              durationMs: Date.now() - startMs,
              status: 'error',
              error: err.message,
            }),
          );
        },
      }),
    );
  }
}
