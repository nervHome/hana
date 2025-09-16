import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { ResponseHelper } from '../helpers/response.helper';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let errors:
      | Array<{ field?: string; message: string; code?: string }>
      | undefined;
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string) ||
          (responseObj.error as string) ||
          'Bad Request';

        // 处理验证错误
        if (
          exception instanceof BadRequestException &&
          Array.isArray(responseObj.message)
        ) {
          errors = (responseObj.message as string[]).map((msg: string) => ({
            message: msg,
            code: 'VALIDATION_ERROR',
          }));
          errorCode = 'VALIDATION_ERROR';
        }
      } else {
        message = 'HTTP Exception';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = 'INTERNAL_ERROR';
    } else {
      message = 'Unknown error occurred';
      errorCode = 'UNKNOWN_ERROR';
    }

    // 记录错误日志
    this.logger.error(
      {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
        requestId: request.headers['x-request-id'],
      },
      'GlobalExceptionFilter',
    );

    const errorResponse = ResponseHelper.error(
      message,
      errorCode,
      errors,
      exception instanceof Error ? exception.stack : undefined,
      {
        requestId: (request.headers['x-request-id'] as string) || undefined,
      },
    );

    response.status(status).json(errorResponse);
  }
}
