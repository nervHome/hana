# 业务错误HTTP状态码修改说明

## 修改概述

根据业务需求，将所有 `BusinessException` 的HTTP状态码从 **400 Bad Request** 修改为 **200 OK**。

## 修改的文件

### 1. BusinessException 类

**文件**: `src/common/exceptions/business.exception.ts`

**修改内容**:

- 构造函数中的 HTTP 状态码从 `HttpStatus.BAD_REQUEST` 改为 `HttpStatus.OK`
- 更新注释说明，明确业务错误使用 HTTP 200

### 2. 异常过滤器

**文件**: `src/common/filters/all-exceptions.filter.ts`

**修改内容**:

- BusinessException 处理部分强制使用 HTTP 200 状态码
- 日志记录中明确标识 statusCode 为 200

### 3. 文档更新

**文件**:

- `src/common/exceptions/README.md`
- `src/common/docs/http-interceptor-optimization.md`

**修改内容**:

- 更新文档说明，强调业务错误返回 HTTP 200
- 添加 HTTP 200 vs HTTP 400 的对比说明
- 解释为什么使用 HTTP 200 的原因

### 4. JWT策略类型修复

**文件**: `src/auth/strategy/jwt.strategy.ts`

**修改内容**:

- 添加 `JwtPayload` 和 `UserPayload` 接口定义
- 修复 TypeScript 类型错误

## 行为变化

### 之前 (HTTP 400)

```http
POST /api/users
HTTP/1.1 400 Bad Request

{
  "success": false,
  "data": null,
  "errorCode": 40001,
  "message": "邮箱格式不正确",
  "showType": 2
}
```

### 现在 (HTTP 200)

```http
POST /api/users
HTTP/1.1 200 OK

{
  "success": false,
  "data": null,
  "errorCode": 40001,
  "message": "邮箱格式不正确",
  "showType": 2
}
```

## 影响评估

### 对前端的影响

- ✅ **无影响**: 前端应该通过 `response.success` 判断业务成功失败
- ✅ **更好的一致性**: 所有API响应都是 HTTP 200，前端处理更统一

### 对日志和监控的影响

- ✅ **减少误报**: 业务错误不会被监控系统误认为技术错误
- ✅ **清晰区分**: HTTP 4xx/5xx 专门用于技术层面的错误

### 对API网关/负载均衡器的影响

- ✅ **避免重试**: 网关不会因为 HTTP 400 而进行不必要的重试
- ✅ **正确的健康检查**: 业务错误不会影响服务健康状态

## 验证方法

1. **单元测试**: BusinessException 的 `getStatus()` 方法应该返回 200
2. **集成测试**: 实际API调用时，业务错误应该返回 HTTP 200
3. **日志检查**: 确保业务错误的日志中 statusCode 为 200

## 最佳实践

1. **真正的HTTP错误保持原状**:
   - 404 Not Found (路由不存在)
   - 500 Internal Server Error (系统异常)
   - 401 Unauthorized (认证失败)

2. **业务逻辑错误使用 BusinessException**:
   - 参数验证失败
   - 业务规则违反
   - 权限不足
   - 资源不存在（业务层面）

3. **前端判断标准**:

   ```typescript
   // 正确的判断方式
   if (response.success) {
     // 业务成功
   } else {
     // 业务失败，根据 showType 展示错误
   }

   // 错误的判断方式（不要这样做）
   if (response.status === 200) {
     // 这样无法区分业务成功失败
   }
   ```
