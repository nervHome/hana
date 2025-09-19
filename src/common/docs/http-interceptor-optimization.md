# HTTP 拦截器优化总结

## 概述

参照前端的请求拦截机制，我们为 NestJS 后端实现了完整的请求/响应拦截器系统，提供统一的错误处理和数据格式化。

## 实现的功能

### 1. HTTP 请求拦截器 (`HttpRequestInterceptor`)

**功能：**

- 自动为每个请求添加唯一的 `x-request-id`
- 记录请求开始和结束的详细日志
- 自动过滤敏感信息（密码、token等）
- 计算请求耗时

**类似前端的：**

```typescript
// 前端 requestInterceptors
requestInterceptors: [
  (config: RequestOptions) => {
    const url = config?.url?.concat('?token=123');
    return { ...config, url };
  },
];
```

### 2. HTTP 响应拦截器 (`HttpResponseInterceptor`)

**功能：**

- 自动将普通响应包装为 `ResponseStructure` 格式
- 统一错误处理，将各种异常转换为 `BusinessException`
- 记录响应日志和性能指标

**类似前端的：**

```typescript
// 前端 responseInterceptors
responseInterceptors: [
  (response) => {
    const { data } = response as unknown as ResponseStructure;
    if (data?.success === false) {
      message.error('请求失败！');
    }
    return response;
  },
];
```

### 3. 统一异常处理 (`AllExceptionsFilter`)

**功能：**

- 处理 `BusinessException`，直接返回标准格式
- 将验证错误转换为统一的 `ResponseStructure` 格式
- 将其他异常也转换为标准格式

**类似前端的：**

```typescript
// 前端 errorHandler
errorHandler: (error: any, opts: any) => {
  if (error.name === 'BizError') {
    const errorInfo: ResponseStructure = error.info;
    switch (errorInfo.showType) {
      case ErrorShowType.SILENT:
        break;
      case ErrorShowType.WARN_MESSAGE:
        message.warning(errorMessage);
        break;
      case ErrorShowType.ERROR_MESSAGE:
        message.error(errorMessage);
        break;
      // ...
    }
  }
};
```

## 使用方式

### 在 main.ts 中配置

```typescript
// 全局异常过滤器
app.useGlobalFilters(new AllExceptionsFilter(pinoLogger));

// 全局拦截器 - 按顺序执行
app.useGlobalInterceptors(
  new HttpRequestInterceptor(pinoLogger),
  new HttpResponseInterceptor(pinoLogger),
);
```

### 在控制器中使用

```typescript
@Controller('api')
export class ApiController {
  // 普通返回会被自动包装
  @Get('data')
  getData() {
    return { message: 'Hello World' };
    // 自动转换为: { success: true, data: { message: 'Hello World' }, message: '操作成功' }
  }

  // 业务异常会被正确处理
  @Post('action')
  performAction() {
    throw BusinessException.invalidParameter(
      '参数错误',
      ErrorShowType.ERROR_MESSAGE,
    );
    // 返回: { success: false, data: null, errorCode: 40001, message: '参数错误', showType: 2 }
  }
}
```

## 响应格式

## 响应格式

### 成功响应 (HTTP 200)

```json
{
  "success": true,
  "data": { "任意数据" },
  "message": "操作成功"
}
```

### 业务错误响应 (HTTP 200)

```json
{
  "success": false,
  "data": null,
  "errorCode": 40001,
  "message": "错误消息",
  "showType": 2
}
```

**重要**: 所有业务逻辑错误都返回 HTTP 200 状态码，错误信息在响应体中通过 `success: false` 标识。

## 错误显示类型 (ErrorShowType)

- `SILENT = 0`: 静默处理，不显示给用户
- `WARN_MESSAGE = 1`: 警告消息
- `ERROR_MESSAGE = 2`: 错误消息（默认）
- `NOTIFICATION = 3`: 通知形式
- `REDIRECT = 9`: 重定向

## 优势

1. **统一格式**: 所有 API 响应都遵循相同的数据结构
2. **错误分类**: 通过 `showType` 让前端知道如何展示错误
3. **自动化**: 无需手动包装每个响应
4. **日志完整**: 自动记录请求/响应的完整生命周期
5. **安全性**: 自动过滤敏感信息
6. **性能监控**: 自动计算和记录请求耗时

## 与前端配合

前端可以根据 `showType` 字段采用不同的错误展示策略：

```typescript
// 前端处理示例
function handleApiResponse(response: ResponseStructure) {
  if (!response.success && response.showType) {
    switch (response.showType) {
      case ErrorShowType.SILENT:
        console.log('静默错误:', response.message);
        break;
      case ErrorShowType.WARN_MESSAGE:
        message.warning(response.message);
        break;
      case ErrorShowType.ERROR_MESSAGE:
        message.error(response.message);
        break;
      case ErrorShowType.NOTIFICATION:
        notification.error({ message: response.message });
        break;
      case ErrorShowType.REDIRECT:
        // 处理重定向
        window.location.href = '/login';
        break;
    }
  }
}
```
