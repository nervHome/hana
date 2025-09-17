import { randomUUID } from 'crypto'
import type {
  ApiResponse,
  ApiResponseMeta,
  ErrorResponse,
  PaginatedResponse,
  PaginationMeta,
} from '../dto/api-response.dto'

const API_VERSION = '1.0.0'

export function createMeta(
  startTime: number = Date.now(),
  requestId?: string,
): ApiResponseMeta {
  return {
    timestamp: Date.now(),
    requestId: requestId || randomUUID(),
    duration: Date.now() - startTime,
    version: API_VERSION,
  }
}

export function success<T>(
  data: T,
  message?: string,
  meta?: Partial<ApiResponseMeta>,
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: { ...createMeta(), ...meta },
  }
}

export function paginated<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  meta?: Partial<ApiResponseMeta>,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    message,
    pagination,
    meta: { ...createMeta(), ...meta },
  }
}

export function error(
  message: string,
  errorCode?: string,
  errors?: Array<{ field?: string; message: string; code?: string }>,
  stack?: string,
  meta?: Partial<ApiResponseMeta>,
): ErrorResponse {
  return {
    success: false,
    data: null,
    message,
    errorCode,
    errors,
    stack: process.env.NODE_ENV === 'development' ? stack : undefined,
    meta: { ...createMeta(), ...meta },
  }
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
