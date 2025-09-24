import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import type { Request } from 'express'
import { Logger } from 'nestjs-pino'
import type { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

/**
 * HTTP 请求拦截器
 * 类似前端的 requestInterceptors，用于请求预处理和日志记录
 */
@Injectable()
export class HttpRequestInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const startTime = Date.now()

    // 为请求添加唯一ID（如果没有的话）
    if (!request.headers['x-request-id']) {
      request.headers['x-request-id'] = randomUUID()
    }

    // 记录请求开始日志
    this.logger.log(
      {
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        requestId: request.headers['x-request-id'],
        body: this.sanitizeBody(request.body),
        query: request.query,
        params: request.params,
      },
      'HttpRequestInterceptor - Request Start',
    )

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime
          this.logger.log(
            {
              method: request.method,
              url: request.url,
              duration,
              requestId: request.headers['x-request-id'],
              responseDataSize: JSON.stringify(data).length,
            },
            'HttpRequestInterceptor - Request Complete',
          )
        },
        error: (error) => {
          const duration = Date.now() - startTime
          const isDevelopment = process.env.NODE_ENV !== 'production'

          this.logger.error(
            {
              method: request.method,
              url: request.url,
              duration,
              requestId: request.headers['x-request-id'],
              errorMessage: error.message,
              ...(isDevelopment && {
                errorStack: error.stack,
                errorName: error.name,
                errorCode: error.code,
              }),
            },
            'HttpRequestInterceptor - Request Failed',
          )
        },
      }),
    )
  }

  /**
   * 清理请求体中的敏感信息
   */
  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
    const sanitized = { ...(body as Record<string, unknown>) }

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***HIDDEN***'
      }
    }

    return sanitized
  }
}
