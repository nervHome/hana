import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator'
import { StandardPageDTO } from '@/common/dto/pagination.dto'

/**
 * 创建 EPG DTO
 */
export class CreateEpgDTO {
  @IsString()
  @IsNotEmpty()
  epgId: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsUrl({}, { message: 'xmlUrl 必须是有效的 URL' })
  @IsOptional()
  xmlUrl?: string

  @IsString()
  @IsOptional()
  language?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true

  @IsString()
  @IsOptional()
  remark?: string
}

/**
 * 更新 EPG DTO
 */
export class UpdateEpgDTO {
  @IsString()
  @IsOptional()
  name?: string

  @IsUrl({}, { message: 'xmlUrl 必须是有效的 URL' })
  @IsOptional()
  xmlUrl?: string

  @IsString()
  @IsOptional()
  language?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean

  @IsString()
  @IsOptional()
  remark?: string
}

/**
 * 查询 EPG DTO
 */
export class QueryEpgsDTO extends StandardPageDTO {
  @IsString()
  @IsOptional()
  language?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean

  @IsString()
  @IsOptional()
  epgId?: string
}

/**
 * EPG 统计信息 DTO
 */
export class EpgStatsDTO {
  @IsString()
  @IsOptional()
  epgId?: string

  @IsString()
  @IsOptional()
  dateRange?: string // 如 "7d", "30d", "90d"
}
