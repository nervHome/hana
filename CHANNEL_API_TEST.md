## 频道管理 API 测试

### 1. 批量新增频道 (POST /channels/batch)

```bash
curl -X POST http://localhost:4000/channels/batch \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "CCTV-1综合",
      "channelId": "cctv1",
      "epgId": "epg_001",
      "logoUrl": "https://example.com/logo/cctv1.png",
      "language": "zh",
      "country": "CN",
      "isActive": true
    },
    {
      "name": "CCTV-2财经",
      "channelId": "cctv2",
      "epgId": "epg_001",
      "logoUrl": "https://example.com/logo/cctv2.png",
      "language": "zh",
      "country": "CN",
      "isActive": true
    }
  ]'
```

### 2. 分页查询频道 (GET /channels)

```bash
# 基本查询
curl -X GET "http://localhost:4000/channels?page=1&limit=10"

# 按名称搜索
curl -X GET "http://localhost:4000/channels?search=CCTV&page=1&limit=5"

# 按 EPG ID 过滤
curl -X GET "http://localhost:4000/channels?epgId=epg_001&page=1&limit=10"

# 查询活跃频道
curl -X GET "http://localhost:4000/channels?isActive=true&page=1&limit=10"
```

### 3. 获取单个频道 (GET /channels/:id)

```bash
curl -X GET "http://localhost:4000/channels/{channel-id}"
```

### 4. 更新频道 (PUT /channels/:id)

```bash
curl -X PUT http://localhost:4000/channels/{channel-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CCTV-1综合频道",
    "logoUrl": "https://example.com/logo/cctv1_new.png",
    "isActive": false
  }'
```

### 5. 删除频道 (DELETE /channels/:id)

```bash
curl -X DELETE "http://localhost:4000/channels/{channel-id}"
```

## 错误处理测试

### 重复 channelId 测试

```bash
# 第一次创建成功
curl -X POST http://localhost:4000/channels/batch \
  -H "Content-Type: application/json" \
  -d '[{"name": "测试频道", "channelId": "test", "epgId": "epg_001"}]'

# 第二次创建相同的 channelId + epgId 组合，应该返回冲突错误
curl -X POST http://localhost:4000/channels/batch \
  -H "Content-Type: application/json" \
  -d '[{"name": "测试频道2", "channelId": "test", "epgId": "epg_001"}]'
```

### 数据验证测试

```bash
# 缺少必填字段
curl -X POST http://localhost:4000/channels/batch \
  -H "Content-Type: application/json" \
  -d '[{"name": "测试频道"}]'  # 缺少 channelId 和 epgId

# 无效的 UUID
curl -X GET "http://localhost:4000/channels/invalid-uuid"
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... },
  "pagination": {  // 仅分页查询时存在
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

```json
{
  "success": false,
  "statusCode": 400,
  "message": "错误描述",
  "error": "Bad Request"
}
```
