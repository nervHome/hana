import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

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

export class QueryChannelsDTO {
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @Type(() => Number)
  limit?: number = 10

  @IsString()
  @IsOptional()
  search?: string

  @IsString()
  @IsOptional()
  epgId?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean
}
