import { Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { StandardPageDTO } from '@/common/dto/pagination.dto'

export class CreateChannelDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  channelId: string

  @IsString()
  @IsNotEmpty()
  epgId: string

  @IsString()
  @IsOptional()
  logoUrl?: string | null

  @IsString()
  @IsOptional()
  language?: string | null

  @IsString()
  @IsOptional()
  country?: string | null

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true

  @IsString()
  @IsOptional()
  remark?: string
}

export class UpdateChannelDTO {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  logoUrl?: string | null

  @IsString()
  @IsOptional()
  language?: string | null

  @IsString()
  @IsOptional()
  country?: string | null

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean
}

export class QueryChannelsDTO extends StandardPageDTO {
  @IsString()
  @IsOptional()
  epgId?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean

  // 兼容旧的命名方式 - 继承自 StandardPageDTO
  // page, limit, search 属性已经在父类中定义
}
