import { randomUUID } from 'crypto';
import {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  ApiResponseMeta,
  PaginationMeta,
} from '../dto/api-response.dto';

export class ResponseHelper {
  private static readonly API_VERSION = '1.0.0';

  static createMeta(
    startTime: number = Date.now(),
    requestId?: string,
  ): ApiResponseMeta {
    return {
      timestamp: Date.now(),
      requestId: requestId || randomUUID(),
      duration: Date.now() - startTime,
      version: this.API_VERSION,
    };
  }

  static success<T>(
    data: T,
    message?: string,
    meta?: Partial<ApiResponseMeta>,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: { ...this.createMeta(), ...meta },
    };
  }

  static paginated<T>(
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
      meta: { ...this.createMeta(), ...meta },
    };
  }

  static error(
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
      meta: { ...this.createMeta(), ...meta },
    };
  }

  static createPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

// React Query 友好的缓存键生成器
export class CacheKeyHelper {
  static epg = {
    all: () => ['epg'] as const,
    lists: () => [...this.epg.all(), 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...this.epg.lists(), filters] as const,
    details: () => [...this.epg.all(), 'detail'] as const,
    detail: (id: string) => [...this.epg.details(), id] as const,
    programmes: () => [...this.epg.all(), 'programmes'] as const,
    programmesByTime: (
      startTime: Date,
      durationHours: number,
      channelIds?: string[],
    ) =>
      [
        ...this.epg.programmes(),
        'timeRange',
        startTime.toISOString(),
        durationHours,
        channelIds,
      ] as const,
    currentProgrammes: () => [...this.epg.programmes(), 'current'] as const,
  };

  static channel = {
    all: () => ['channel'] as const,
    lists: () => [...this.channel.all(), 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...this.channel.lists(), filters] as const,
    details: () => [...this.channel.all(), 'detail'] as const,
    detail: (id: string) => [...this.channel.details(), id] as const,
  };
}
