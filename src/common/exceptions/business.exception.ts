import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * 错误处理方案：错误类型
 */
export enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

/**
 * 与后端约定的响应数据格式
 */
export interface ResponseStructure {
  success: boolean
  data: unknown
  errorCode?: number
  message?: string
  showType?: ErrorShowType
}

/**
 * 业务错误码定义
 */
export enum BusinessErrorCode {
  // 通用业务错误
  BUSINESS_ERROR = 40000,

  // 参数验证错误 40001-40099
  INVALID_PARAMETER = 40001,

  // 资源相关错误 40100-40199
  RESOURCE_NOT_FOUND = 40100,

  // 权限相关错误 40200-40299
  INSUFFICIENT_PERMISSION = 40200,

  // 操作冲突错误 40300-40399
  OPERATION_CONFLICT = 40300,

  // 业务规则错误 40400-40499
  BUSINESS_RULE_VIOLATION = 40400,
}

/**
 * 业务逻辑异常
 * 用于处理业务层面的错误，状态码为 400 Bad Request
 */
export class BusinessException extends HttpException {
  public readonly errorCode: number
  public readonly showType: ErrorShowType
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    errorCode: number = BusinessErrorCode.BUSINESS_ERROR,
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
    details?: Record<string, unknown>,
  ) {
    const response: ResponseStructure = {
      success: false,
      data: null,
      errorCode,
      message,
      showType,
    }

    super(response, HttpStatus.BAD_REQUEST)
    this.errorCode = errorCode
    this.showType = showType
    this.details = details
  }

  /**
   * 创建一个通用的业务错误
   */
  static create(
    message: string,
    errorCode?: number,
    showType?: ErrorShowType,
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(message, errorCode, showType, details)
  }

  /**
   * 创建参数验证错误
   */
  static invalidParameter(
    message: string = '参数无效',
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(
      message,
      BusinessErrorCode.INVALID_PARAMETER,
      showType,
      details,
    )
  }

  /**
   * 创建资源不存在错误
   */
  static resourceNotFound(
    message: string = '资源不存在',
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(
      message,
      BusinessErrorCode.RESOURCE_NOT_FOUND,
      showType,
      details,
    )
  }

  /**
   * 创建权限不足错误
   */
  static insufficientPermission(
    message: string = '权限不足',
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(
      message,
      BusinessErrorCode.INSUFFICIENT_PERMISSION,
      showType,
      details,
    )
  }

  /**
   * 创建操作冲突错误
   */
  static operationConflict(
    message: string = '操作冲突',
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(
      message,
      BusinessErrorCode.OPERATION_CONFLICT,
      showType,
      details,
    )
  }

  /**
   * 创建业务规则违反错误
   */
  static businessRuleViolation(
    message: string = '违反业务规则',
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
    details?: Record<string, unknown>,
  ): BusinessException {
    return new BusinessException(
      message,
      BusinessErrorCode.BUSINESS_RULE_VIOLATION,
      showType,
      details,
    )
  }
}
