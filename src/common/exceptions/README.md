# BusinessException 使用指南

## 概述

`BusinessException` 是一个专门用于处理业务逻辑错误的自定义异常类，它继承自 NestJS 的 `HttpException`，并固定返回 HTTP 状态码 400 (Bad Request)。

## 特性

- ✅ 固定状态码 400，专用于业务逻辑错误
- ✅ 支持自定义错误码 (errorCode)
- ✅ 支持详细错误信息 (details)
- ✅ 自动添加时间戳
- ✅ 提供多种便捷的静态方法
- ✅ 与现有的异常过滤器完全兼容

## 安装与导入

```typescript
// 从 common 模块导入
import { BusinessException } from '@/common';

// 或者直接导入
import { BusinessException } from '@/common/exceptions';
```

## 基本用法

### 1. 创建通用业务错误

```typescript
// 最简单的用法
throw BusinessException.create('用户名已存在');

// 带自定义错误码
throw BusinessException.create('用户名已存在', 'USERNAME_ALREADY_EXISTS');

// 带详细信息
throw BusinessException.create('用户名已存在', 'USERNAME_ALREADY_EXISTS', {
  username: 'john_doe',
  suggestedUsernames: ['john_doe_1', 'john_doe_2'],
});
```

### 2. 使用预定义的便捷方法

#### 参数验证错误

```typescript
throw BusinessException.invalidParameter('邮箱格式不正确');
throw BusinessException.invalidParameter('年龄必须在18-100之间', {
  age: 15,
  min: 18,
  max: 100,
});
```

#### 资源不存在错误

```typescript
throw BusinessException.resourceNotFound('用户不存在');
throw BusinessException.resourceNotFound('订单不存在', { orderId: '12345' });
```

#### 权限不足错误

```typescript
throw BusinessException.insufficientPermission('无权限访问此资源');
throw BusinessException.insufficientPermission('只有管理员可以执行此操作', {
  userRole: 'user',
  requiredRole: 'admin',
});
```

#### 操作冲突错误

```typescript
throw BusinessException.operationConflict('订单已取消，无法修改');
throw BusinessException.operationConflict('用户已被锁定', {
  userId: '123',
  status: 'locked',
});
```

#### 业务规则违反错误

```typescript
throw BusinessException.businessRuleViolation('余额不足');
throw BusinessException.businessRuleViolation('单日转账限额超限', {
  dailyLimit: 10000,
  currentAmount: 5000,
  requestAmount: 6000,
});
```

### 3. 直接使用构造函数

```typescript
throw new BusinessException('自定义错误消息', 'CUSTOM_ERROR_CODE', {
  customField: 'customValue',
  timestamp: new Date().toISOString(),
});
```

## 响应格式

当抛出 `BusinessException` 时，客户端将收到以下格式的响应：

```json
{
  "success": false,
  "data": null,
  "message": "用户名已存在",
  "errorCode": "USERNAME_ALREADY_EXISTS",
  "errors": [
    {
      "message": "用户名已存在",
      "code": "USERNAME_ALREADY_EXISTS",
      "field": undefined
    }
  ],
  "stack": "Error stack trace (仅在开发环境)",
  "meta": {
    "timestamp": 1694123456789,
    "requestId": "uuid-string",
    "duration": 45,
    "version": "1.0.0"
  }
}
```

## 在 Service 中的使用示例

```typescript
import { Injectable } from '@nestjs/common';
import { BusinessException } from '@/common';

@Injectable()
export class UsersService {
  async createUser(userData: CreateUserDto) {
    // 检查用户名是否已存在
    const existingUser = await this.findByUsername(userData.username);
    if (existingUser) {
      throw BusinessException.create(
        '用户名已存在',
        'USERNAME_ALREADY_EXISTS',
        { username: userData.username },
      );
    }

    // 验证邮箱格式
    if (!this.isValidEmail(userData.email)) {
      throw BusinessException.invalidParameter('邮箱格式不正确', {
        email: userData.email,
      });
    }

    // 创建用户...
    return this.userRepository.create(userData);
  }

  async deleteUser(userId: string, currentUserId: string) {
    // 检查用户是否存在
    const user = await this.findById(userId);
    if (!user) {
      throw BusinessException.resourceNotFound('用户不存在', { userId });
    }

    // 检查权限
    if (userId !== currentUserId && !this.isAdmin(currentUserId)) {
      throw BusinessException.insufficientPermission(
        '只能删除自己的账户或需要管理员权限',
      );
    }

    // 检查业务规则
    if (user.status === 'deleted') {
      throw BusinessException.operationConflict('用户已被删除', {
        userId,
        status: user.status,
      });
    }

    // 删除用户...
    return this.userRepository.delete(userId);
  }
}
```

## 在 Controller 中的使用

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { BusinessException } from '@/common';

@Controller('users')
export class UsersController {
  @Post()
  async createUser(@Body() userData: CreateUserDto) {
    // Service 层会抛出 BusinessException
    // 异常过滤器会自动处理并返回适当的响应
    return await this.usersService.createUser(userData);
  }
}
```

## 错误码规范建议

为了保持一致性，建议使用以下错误码命名规范：

- `INVALID_PARAMETER` - 参数验证错误
- `RESOURCE_NOT_FOUND` - 资源不存在
- `INSUFFICIENT_PERMISSION` - 权限不足
- `OPERATION_CONFLICT` - 操作冲突
- `BUSINESS_RULE_VIOLATION` - 业务规则违反
- `USERNAME_ALREADY_EXISTS` - 用户名已存在
- `EMAIL_ALREADY_EXISTS` - 邮箱已存在
- `INSUFFICIENT_BALANCE` - 余额不足
- `DAILY_LIMIT_EXCEEDED` - 日限额超限

## 注意事项

1. **状态码固定为 400**：BusinessException 专门用于业务逻辑错误，状态码固定为 400
2. **与异常过滤器配合**：确保 `AllExceptionsFilter` 已正确配置来处理 BusinessException
3. **详细信息安全**：避免在 details 中暴露敏感信息，如密码、密钥等
4. **错误码一致性**：在整个项目中保持错误码的一致性和可读性
5. **国际化支持**：考虑将错误消息提取到国际化文件中
