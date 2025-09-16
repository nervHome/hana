import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  get skip(): number {
    return (this.page! - 1) * this.limit!;
  }
}

export class SearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  filter?: string;
}

export class TimeRangeDto {
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startTime?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endTime?: Date;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(24)
  durationHours?: number;
}

export class EpgQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  channelIds?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startTime?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endTime?: Date;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(24)
  durationHours?: number;

  get channelIdList(): string[] | undefined {
    return this.channelIds
      ? this.channelIds.split(',').filter(Boolean)
      : undefined;
  }
}

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class EpgCurrentDto extends CursorPaginationDto {
  @IsOptional()
  @IsString()
  channelIds?: string;

  get channelIdList(): string[] | undefined {
    return this.channelIds
      ? this.channelIds.split(',').filter(Boolean)
      : undefined;
  }
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    prevCursor?: string;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalCount: number;
  };
}
