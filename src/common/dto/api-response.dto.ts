import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class ApiResponseMeta {
  @IsNumber()
  timestamp: number

  @IsString()
  requestId: string

  @IsNumber()
  duration: number

  @IsString()
  version: string
}

export class PaginationMeta {
  @IsNumber()
  page: number

  @IsNumber()
  limit: number

  @IsNumber()
  total: number

  @IsNumber()
  totalPages: number

  @IsBoolean()
  hasNext: boolean

  @IsBoolean()
  hasPrev: boolean
}

export class ApiResponse<T = unknown> {
  @IsBoolean()
  success: boolean

  data: T

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsString()
  errorCode?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationMeta)
  pagination?: PaginationMeta

  @ValidateNested()
  @Type(() => ApiResponseMeta)
  meta: ApiResponseMeta
}

export class PaginatedResponse<T = unknown> {
  @IsBoolean()
  success: boolean

  data: T[]

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsString()
  errorCode?: string

  @ValidateNested()
  @Type(() => PaginationMeta)
  pagination: PaginationMeta

  @ValidateNested()
  @Type(() => ApiResponseMeta)
  meta: ApiResponseMeta
}

export class ErrorResponse {
  @IsBoolean()
  success: boolean = false

  data: null = null

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsString()
  errorCode?: string

  @ValidateNested()
  @Type(() => ApiResponseMeta)
  meta: ApiResponseMeta

  errors?: Array<{
    field?: string
    message: string
    code?: string
  }>

  @IsOptional()
  @IsString()
  stack?: string
}
