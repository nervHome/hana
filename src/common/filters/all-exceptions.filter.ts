import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { Logger } from 'nestjs-pino'
import {
  BusinessException,
  ErrorShowType,
  type ResponseStructure,
} from '../exceptions'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    let message: string
    let errorCode: number | undefined
    let showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>
        message =
          (responseObj.message as string) ||
          (responseObj.error as string) ||
          'Bad Request'

        // 处理 BusinessException
        if (exception instanceof BusinessException) {
          errorCode = responseObj.errorCode as number
          showType =
            (responseObj.showType as ErrorShowType) ||
            ErrorShowType.ERROR_MESSAGE

          // 直接返回 BusinessException 的响应格式
          const businessResponse: ResponseStructure = {
            success: false,
            data: null,
            errorCode,
            message,
            showType,
          }

          // 记录错误日志
          this.logger.error(
            {
              statusCode: 200, // BusinessException 总是返回 HTTP 200
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              message,
              errorCode,
              showType,
              stack: exception.stack,
              requestId: request.headers['x-request-id'],
            },
            'BusinessExceptionFilter',
          )

          // BusinessException 使用 HTTP 200 状态码
          response.status(200).json(businessResponse)
          return
        }
        // 处理验证错误
        else if (
          exception instanceof BadRequestException &&
          Array.isArray(responseObj.message)
        ) {
          // 提取具体的验证错误信息
          const validationErrors = responseObj.message as string[]
          const detailedMessage =
            validationErrors.length > 0
              ? `参数验证失败: ${validationErrors.join('; ')}`
              : '参数验证失败'

          // 将验证错误转换为统一格式
          const validationResponse: ResponseStructure = {
            success: false,
            data: null,
            errorCode: 40001, // 使用参数验证错误码
            message: detailedMessage,
            showType: ErrorShowType.ERROR_MESSAGE,
          }

          const isDevelopment = process.env.NODE_ENV !== 'production'

          // 记录错误日志
          this.logger.error(
            {
              statusCode: status,
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              message: validationResponse.message,
              errorCode: validationResponse.errorCode,
              validationErrors: responseObj.message,
              requestId: request.headers['x-request-id'],
              ...(isDevelopment && {
                stack: exception.stack,
                exceptionName: exception.name,
              }),
            },
            'ValidationExceptionFilter',
          )

          response.status(status).json(validationResponse)
          return
        }
      } else {
        message = 'HTTP Exception'
      }
    } else if (exception instanceof Error) {
      message = exception.message
      console.log(exception)

      errorCode = 50000 // 内部服务器错误
    } else {
      message = 'Unknown error occurred'
      errorCode = 50001 // 未知错误
    }

    // 处理其他异常 - 转换为统一格式
    const generalResponse: ResponseStructure = {
      success: false,
      data: null,
      errorCode: errorCode || 50000,
      message,
      showType: ErrorShowType.ERROR_MESSAGE,
    }

    // 记录错误日志
    this.logger.error(
      {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
        errorCode: generalResponse.errorCode,
        stack: exception instanceof Error ? exception.stack : undefined,
        requestId: request.headers['x-request-id'],
      },
      'GlobalExceptionFilter',
    )

    response.status(status).json(generalResponse)
  }
}
