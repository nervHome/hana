# BusinessException 使用指南 (更新版)

#### 使用方式对比

### 之前 (HTTP 400)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "data": null,
  "errorCode": 40001,
  "message": "参数验证失败",
  "showType": 2
}
```

### 现在 (HTTP 200)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": false,
  "data": null,
  "errorCode": 40001,
  "message": "参数验证失败",
  "showType": 2
}
```

## 为什么使用 HTTP 200？

1. **业务逻辑vs技术错误分离**
   - HTTP 200: 请求成功处理，业务结果在响应体中
   - HTTP 4xx/5xx: 技术层面的错误（网络、服务器等）

2. **前端处理简化**
   - 前端不需要处理HTTP状态码
   - 统一通过 `response.success` 判断业务成功失败

3. **API网关友好**
   - 避免网关误判业务错误为技术错误
   - 减少不必要的重试和降级essException`是一个专门用于处理业务逻辑错误的自定义异常类，它继承自 NestJS 的`HttpException`，但**固定返回 HTTP 状态码 200 (OK)**，错误信息在响应体中通过 `success: false` 标识。

## 重要变更 (v2.1)

⚠️ **HTTP状态码变更**:

- 业务错误现在返回 **HTTP 200 OK** 而不是 400 Bad Request
- 错误信息通过响应体中的 `success: false` 和 `errorCode` 来标识
- 这种设计更适合前后端分离的场景，让前端统一处理业务逻辑错误

## 新特性 (v2.0)

- ✅ **HTTP 200 状态码** - 所有业务错误都返回200，错误信息在响应体中
- ✅ 支持 `ErrorShowType` 枚举，控制前端错误显示方式
- ✅ 使用数字错误码替代字符串错误码
- ✅ 统一的 `ResponseStructure` 响应格式
- ✅ 预定义的业务错误码枚举
- ✅ 完全兼容新的错误处理规范

## 错误显示类型 (ErrorShowType)

```typescript
enum ErrorShowType {
  SILENT = 0, // 静默处理，不显示给用户
  WARN_MESSAGE = 1, // 警告消息
  ERROR_MESSAGE = 2, // 错误消息（默认）
  NOTIFICATION = 3, // 通知形式
  REDIRECT = 9, // 重定向
}
```

## 响应格式

```typescript
interface ResponseStructure {
  success: boolean; // 请求是否成功
  data: unknown; // 响应数据，错误时为 null
  errorCode?: number; // 数字错误码
  message?: string; // 错误/成功消息
  showType?: ErrorShowType; // 前端显示方式
}
```

## 预定义错误码

```typescript
enum BusinessErrorCode {
  // 通用业务错误
  BUSINESS_ERROR = 40000,

  // 参数验证错误 40001-40099
  INVALID_PARAMETER = 40001,

  // 资源相关错误 40100-40199
  RESOURCE_NOT_FOUND = 40100,

  // 权限相关错误 40200-40299
  INSUFFICIENT_PERMISSION = 40200,

  // 操作冲突错误 40300-40399
  OPERATION_CONFLICT = 40300,

  // 业务规则错误 40400-40499
  BUSINESS_RULE_VIOLATION = 40400,
}
```

## 基本用法

### 1. 导入所需组件

```typescript
import {
  BusinessException,
  ErrorShowType,
  BusinessErrorCode,
} from '@/common/exceptions';
```

### 2. 使用预定义的便捷方法

```typescript
// 参数验证错误 - 警告消息
throw BusinessException.invalidParameter(
  '邮箱格式不正确',
  ErrorShowType.WARN_MESSAGE,
  { email: 'invalid-email' },
);

// 资源不存在 - 通知形式
throw BusinessException.resourceNotFound(
  '用户不存在',
  ErrorShowType.NOTIFICATION,
  { userId: '123' },
);

// 权限不足 - 静默处理
throw BusinessException.insufficientPermission(
  '权限不足',
  ErrorShowType.SILENT,
);

// 操作冲突 - 重定向
throw BusinessException.operationConflict(
  '状态冲突，即将重定向',
  ErrorShowType.REDIRECT,
);
```

### 3. 自定义错误

```typescript
// 使用 create 方法
throw BusinessException.create(
  '自定义错误消息',
  BusinessErrorCode.BUSINESS_ERROR,
  ErrorShowType.ERROR_MESSAGE,
  { customData: 'value' },
);

// 直接使用构造函数
throw new BusinessException(
  '详细错误描述',
  50001, // 自定义错误码
  ErrorShowType.NOTIFICATION,
  { additionalInfo: 'details' },
);
```

## 完整的响应示例

当抛出 BusinessException 时，客户端将收到：

```json
{
  "success": false,
  "data": null,
  "errorCode": 40001,
  "message": "邮箱格式不正确",
  "showType": 1
}
```

成功响应格式：

```json
{
  "success": true,
  "data": { "user": { "id": 1, "name": "张三" } },
  "message": "操作成功"
}
```

## 在 Service 中的实际应用

```typescript
@Injectable()
export class UsersService {
  async createUser(userData: CreateUserDto) {
    // 参数验证
    if (!userData.email) {
      throw BusinessException.invalidParameter(
        '邮箱是必填项',
        ErrorShowType.ERROR_MESSAGE,
      );
    }

    // 检查资源是否存在
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw BusinessException.operationConflict(
        '该邮箱已被注册',
        ErrorShowType.WARN_MESSAGE,
        { email: userData.email },
      );
    }

    // 业务规则验证
    if (userData.age < 18) {
      throw BusinessException.businessRuleViolation(
        '用户年龄必须满18岁',
        ErrorShowType.ERROR_MESSAGE,
        { age: userData.age, minAge: 18 },
      );
    }

    return await this.userRepository.create(userData);
  }

  async deleteUser(userId: string, currentUserId: string) {
    // 权限检查
    if (userId !== currentUserId && !this.isAdmin(currentUserId)) {
      throw BusinessException.insufficientPermission(
        '只能删除自己的账户',
        ErrorShowType.SILENT,
        { action: 'delete_user', targetId: userId },
      );
    }

    const user = await this.findById(userId);
    if (!user) {
      throw BusinessException.resourceNotFound(
        '用户不存在',
        ErrorShowType.NOTIFICATION,
      );
    }

    return await this.userRepository.delete(userId);
  }
}
```

## 前端错误处理建议

根据 `showType` 字段，前端可以采用不同的错误处理策略：

```typescript
// 前端响应处理示例
function handleResponse(response: ResponseStructure) {
  if (!response.success) {
    switch (response.showType) {
      case ErrorShowType.SILENT:
        // 静默处理，可能只记录日志
        console.error('Silent error:', response.message);
        break;

      case ErrorShowType.WARN_MESSAGE:
        // 显示警告提示
        showWarningToast(response.message);
        break;

      case ErrorShowType.ERROR_MESSAGE:
        // 显示错误消息
        showErrorDialog(response.message);
        break;

      case ErrorShowType.NOTIFICATION:
        // 显示通知
        showNotification(response.message);
        break;

      case ErrorShowType.REDIRECT:
        // 重定向处理
        showErrorAndRedirect(response.message);
        break;
    }
  }
}
```

## 错误码规范

- **40000-40099**: 通用业务错误和参数验证
- **40100-40199**: 资源相关错误
- **40200-40299**: 权限相关错误
- **40300-40399**: 操作冲突错误
- **40400-40499**: 业务规则错误
- **50000+**: 系统级错误

## 迁移指南

如果您之前使用的是字符串错误码版本，需要进行以下更新：

```typescript
// 旧版本
throw BusinessException.create('错误消息', 'ERROR_CODE');

// 新版本
throw BusinessException.create(
  '错误消息',
  BusinessErrorCode.BUSINESS_ERROR,
  ErrorShowType.ERROR_MESSAGE,
);
```

## 注意事项

1. **状态码固定为 400**: 所有 BusinessException 都返回 HTTP 400
2. **错误码唯一性**: 确保自定义错误码不与预定义错误码冲突
3. **showType 选择**: 根据业务场景选择合适的显示类型
4. **详细信息安全**: 避免在 details 中暴露敏感信息
5. **前后端协调**: 确保前端正确处理不同的 showType
