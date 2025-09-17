import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common'
import type { Logger } from 'nestjs-pino'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import type { ApiResponse } from '../dto/api-response.dto'
import * as ResponseHelper from '../helpers/response.helper'

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly logger: Logger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest()
    const startTime = Date.now()

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - startTime

        this.logger.log(
          {
            method: request.method,
            url: request.url,
            responseTime: `${responseTime}ms`,
          },
          'ResponseInterceptor',
        )

        // 如果数据已经是 ApiResponse 格式，直接返回
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'meta' in data
        ) {
          return data
        }

        // 否则包装成标准格式
        return ResponseHelper.success(data, undefined, {
          requestId: request.headers['x-request-id'] || undefined,
          duration: responseTime,
        })
      }),
    )
  }
}
