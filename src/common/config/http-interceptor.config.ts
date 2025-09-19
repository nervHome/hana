import { ErrorShowType } from '../exceptions'

/**
 * HTTP 拦截器配置
 * 类似前端的 errorConfig
 */
export interface HttpInterceptorConfig {
  // 请求拦截器配置
  request: {
    // 是否记录请求日志
    enableLogging: boolean
    // 是否自动添加请求ID
    autoAddRequestId: boolean
    // 敏感字段列表
    sensitiveFields: string[]
  }

  // 响应拦截器配置
  response: {
    // 是否记录响应日志
    enableLogging: boolean
    // 默认成功消息
    defaultSuccessMessage: string
    // 是否自动包装响应
    autoWrapResponse: boolean
  }

  // 错误处理配置
  error: {
    // 默认错误显示类型
    defaultShowType: ErrorShowType
    // 是否在开发环境显示错误堆栈
    showStackInDev: boolean
    // 错误消息映射
    errorMessageMap: Record<string, string>
  }
}

/**
 * 默认拦截器配置
 */
export const defaultHttpInterceptorConfig: HttpInterceptorConfig = {
  request: {
    enableLogging: true,
    autoAddRequestId: true,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'authorization',
    ],
  },
  response: {
    enableLogging: true,
    defaultSuccessMessage: '操作成功',
    autoWrapResponse: true,
  },
  error: {
    defaultShowType: ErrorShowType.ERROR_MESSAGE,
    showStackInDev: process.env.NODE_ENV === 'development',
    errorMessageMap: {
      ValidationError: '数据验证失败',
      UnauthorizedError: '未授权访问',
      NotFoundError: '资源不存在',
      TimeoutError: '请求超时',
      NetworkError: '网络连接失败',
    },
  },
}
