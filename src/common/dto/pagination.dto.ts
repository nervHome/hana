import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

/**
 * 通用分页参数类型
 */
export type PageParams = {
  current?: number
  pageSize?: number
  keyword?: string
}

/**
 * 分页响应数据类型
 */
export type PaginationResult<T> = {
  data: T[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @IsOptional()
  @IsString()
  sortBy?: string

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10)
  }
}

export class SearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  filter?: string
}

export class TimeRangeDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startTime?: Date

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endTime?: Date

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(24)
  durationHours?: number
}

export class EpgQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  channelIds?: string

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startTime?: Date

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endTime?: Date

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(24)
  durationHours?: number

  get channelIdList(): string[] | undefined {
    return this.channelIds
      ? this.channelIds.split(',').filter(Boolean)
      : undefined
  }
}

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @IsOptional()
  @IsString()
  sortBy?: string = 'id'

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc'
}

export class EpgCurrentDto extends CursorPaginationDto {
  @IsOptional()
  @IsString()
  channelIds?: string

  get channelIdList(): string[] | undefined {
    return this.channelIds
      ? this.channelIds.split(',').filter(Boolean)
      : undefined
  }
}

export interface CursorPaginationResult<T> {
  data: T[]
  pagination: {
    nextCursor?: string
    prevCursor?: string
    hasNextPage: boolean
    hasPrevPage: boolean
    totalCount: number
  }
}

/**
 * 新标准分页 DTO - 使用 current 和 pageSize
 */
export class StandardPageDTO {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  current?: number = 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 10

  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @IsString()
  sortBy?: string

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'

  // 兼容旧的命名方式
  get page(): number {
    return this.current || 1
  }

  get limit(): number {
    return this.pageSize || 10
  }

  get skip(): number {
    return ((this.current || 1) - 1) * (this.pageSize || 10)
  }

  get take(): number {
    return this.pageSize || 10
  }

  get search(): string | undefined {
    return this.keyword
  }
}

/**
 * 分页查询工具函数
 */
export namespace PaginationHelper {
  /**
   * 构建分页响应数据
   */
  export function buildPaginationResult<T>(
    data: T[],
    total: number,
    current: number,
    pageSize: number,
  ): PaginationResult<T> {
    return {
      data,
      pagination: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  /**
   * 构建标准 API 响应数据
   */
  export function buildApiResponse<T>(
    data: T[],
    total: number,
    current: number,
    pageSize: number,
    message?: string,
  ): {
    success: boolean
    message?: string
    data: T[]
    pagination: {
      current: number
      pageSize: number
      total: number
      totalPages: number
    }
  } {
    return {
      success: true,
      message,
      data,
      pagination: {
        current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }
}
