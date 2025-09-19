import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { Logger } from 'nestjs-pino'
import type { Observable } from 'rxjs'
import { throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import {
  BusinessErrorCode,
  BusinessException,
  ErrorShowType,
  type ResponseStructure,
} from '../exceptions'
import * as ResponseHelper from '../helpers/response.helper'

/**
 * HTTP 响应拦截器
 * 统一处理响应格式和错误处理，类似前端的请求拦截器
 */
@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseStructure> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const startTime = Date.now()

    return next.handle().pipe(
      // 成功响应处理
      map((data) => {
        const duration = Date.now() - startTime

        // 记录成功请求日志
        this.logger.log(
          {
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            duration,
            requestId: request.headers['x-request-id'],
          },
          'HttpResponseInterceptor',
        )

        // 如果数据已经是 ResponseStructure 格式，直接返回
        if (this.isResponseStructure(data)) {
          return data as ResponseStructure
        }

        // 否则包装成标准格式
        return ResponseHelper.createSuccessResponse(data, '操作成功')
      }),

      // 错误处理
      catchError((error) => {
        const duration = Date.now() - startTime

        // 记录错误日志
        this.logger.error(
          {
            method: request.method,
            url: request.url,
            duration,
            error: error.message,
            stack: error.stack,
            requestId: request.headers['x-request-id'],
          },
          'HttpResponseInterceptor',
        )

        // 如果是 BusinessException，已经被 AllExceptionsFilter 处理
        if (error instanceof BusinessException) {
          return throwError(() => error)
        }

        // 处理其他类型的错误
        return throwError(() => this.handleError(error))
      }),
    )
  }

  /**
   * 检查数据是否已经是 ResponseStructure 格式
   */
  private isResponseStructure(data: unknown): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'data' in data
    )
  }

  /**
   * 错误处理器 - 类似前端的 errorHandler
   */
  private handleError(error: Error): BusinessException {
    // 根据错误类型返回不同的业务异常
    if (error.name === 'ValidationError') {
      return new BusinessException(
        '数据验证失败',
        BusinessErrorCode.INVALID_PARAMETER,
        ErrorShowType.ERROR_MESSAGE,
        { originalError: error.message },
      )
    }

    if (error.name === 'UnauthorizedError') {
      return new BusinessException(
        '未授权访问',
        BusinessErrorCode.INSUFFICIENT_PERMISSION,
        ErrorShowType.REDIRECT,
        { originalError: error.message },
      )
    }

    if (error.name === 'NotFoundError') {
      return new BusinessException(
        '资源不存在',
        BusinessErrorCode.RESOURCE_NOT_FOUND,
        ErrorShowType.ERROR_MESSAGE,
        { originalError: error.message },
      )
    }

    // 默认内部服务器错误
    return new BusinessException(
      error.message || '服务器内部错误',
      50000,
      ErrorShowType.ERROR_MESSAGE,
      {
        originalError: error.message,
        errorName: error.name,
      },
    )
  }
}
