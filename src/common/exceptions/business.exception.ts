import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * 业务逻辑异常
 * 用于处理业务层面的错误，状态码为 400 Bad Request
 */
export class BusinessException extends HttpException {
  public readonly errorCode: string
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    errorCode: string = 'BUSINESS_ERROR',
    details?: Record<string, unknown>,
  ) {
    const response = {
      message,
      errorCode,
      details,
      timestamp: new Date().toISOString(),
    }

    super(response, HttpStatus.BAD_REQUEST)
    this.errorCode = errorCode
    this.details = details
  }

  /**
   * 创建一个通用的业务错误
   */
  static create(
    message: string,
    errorCode?: string,
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(message, errorCode, details)
  }

  /**
   * 创建参数验证错误
   */
  static invalidParameter(
    message: string = '参数无效',
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(message, 'INVALID_PARAMETER', details)
  }

  /**
   * 创建资源不存在错误
   */
  static resourceNotFound(
    message: string = '资源不存在',
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(message, 'RESOURCE_NOT_FOUND', details)
  }

  /**
   * 创建权限不足错误
   */
  static insufficientPermission(
    message: string = '权限不足',
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(message, 'INSUFFICIENT_PERMISSION', details)
  }

  /**
   * 创建操作冲突错误
   */
  static operationConflict(
    message: string = '操作冲突',
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(message, 'OPERATION_CONFLICT', details)
  }

  /**
   * 创建业务规则违反错误
   */
  static businessRuleViolation(
    message: string = '违反业务规则',
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(message, 'BUSINESS_RULE_VIOLATION', details)
  }
}
