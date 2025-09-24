# 📋 分页参数标准化

## 🎯 新的分页参数标准

```typescript
type PageParams = {
  current?: number; // 当前页码，从 1 开始
  pageSize?: number; // 每页大小，默认 10，最大 100
  keyword?: string; // 搜索关键词
};
```

## 📊 API 使用示例

### 1. 查询频道列表

**新标准参数：**

```bash
# 基础分页查询
curl "http://localhost:4000/channels?current=1&pageSize=10"

# 带关键词搜索
curl "http://localhost:4000/channels?current=1&pageSize=20&keyword=CCTV"

# 过滤查询
curl "http://localhost:4000/channels?current=1&pageSize=10&epgId=epg001&isActive=true"
```

**兼容旧参数：**

```bash
# 仍然支持 page/limit/search 参数
curl "http://localhost:4000/channels?page=1&limit=10&search=CCTV"
```

## 📝 DTO 定义

```typescript
export class QueryChannelsDTO extends StandardPageDTO {
  @IsString()
  @IsOptional()
  epgId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  // 继承自 StandardPageDTO:
  // - current?: number = 1
  // - pageSize?: number = 10
  // - keyword?: string
  // 同时提供兼容属性: page, limit, search
}
```

## 🔄 响应格式

```json
{
  "success": true,
  "data": [
    {
      "id": "cm...",
      "name": "CCTV-1综合",
      "channelId": "cctv1",
      "epgId": "epg_001",
      "logoUrl": "https://example.com/logo.png",
      "language": "zh",
      "country": "CN",
      "isActive": true,
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🛠️ 工具函数

```typescript
// 使用分页工具构建响应
import { PaginationHelper } from '@/common/dto/pagination.dto';

const result = PaginationHelper.buildPaginationResult(
  data,
  total,
  current,
  pageSize,
);

const apiResponse = PaginationHelper.buildApiResponse(
  data,
  total,
  current,
  pageSize,
  '查询成功',
);
```

## ✅ 优势

1. **标准化命名**：`current` / `pageSize` 更语义化
2. **向后兼容**：仍支持 `page` / `limit` / `search` 参数
3. **统一验证**：数值范围验证（current >= 1, pageSize <= 100）
4. **通用工具**：`PaginationHelper` 提供统一的响应构建
5. **类型安全**：完整的 TypeScript 类型定义

## 🔧 迁移指南

**对于新开发**：直接使用 `current` / `pageSize` / `keyword`

**对于现有代码**：

- 前端可以继续使用 `page` / `limit` / `search`
- 后端通过 getter/setter 自动映射到新标准
- 逐步迁移到新参数名
