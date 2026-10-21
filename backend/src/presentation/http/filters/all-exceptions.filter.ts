import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

const USER_FRIENDLY_MESSAGES: Record<number, string> = {
  400: 'The request contains invalid data. Please check your input and try again.',
  401: 'You are not authenticated. Please log in and try again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data. The resource may already exist.',
  413: 'The uploaded file is too large.',
  422: 'The provided data could not be processed. Please verify your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected error occurred. Please try again later.',
  502: 'The server received an invalid response. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again in a few minutes.',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] =
      'An unexpected error occurred. Please try again later.';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const obj = exResponse as Record<string, unknown>;
        message = (obj.message as string | string[]) ?? exception.message;
        error = (obj.error as string) ?? 'Error';
      }

      // For validation errors (class-validator), provide more readable messages
      if (status === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
        message = message.map((msg) =>
          typeof msg === 'string'
            ? msg.charAt(0).toUpperCase() + msg.slice(1)
            : msg,
        );
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      message = USER_FRIENDLY_MESSAGES[500];
    } else {
      this.logger.error('Unknown exception type', String(exception));
    }

    // Add user-friendly hint if available
    const hint = USER_FRIENDLY_MESSAGES[status];

    response.status(status).json({
      statusCode: status,
      error,
      message,
      ...(hint && typeof message !== 'string' ? { hint } : {}),
      timestamp: new Date().toISOString(),
    });
  }
}
