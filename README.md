# 📺 EPG Admin Service

一个基于 NestJS + Prisma + PostgreSQL 的现代化 EPG（电子节目指南）管理系统后端服务。

## 🎯 项目概述

EPG Admin Service 是一个企业级的后端服务，专注于电视节目数据的管理和API服务。系统采用微服务架构，提供完整的用户认证、权限管理、数据处理和API接口。

### ✨ 核心特性

- 🔐 **完整的认证系统** - JWT + 黑名单机制，支持安全登录/登出
- 👥 **用户权限管理** - 基于角色的访问控制（RBAC）
- 📊 **EPG数据处理** - XML解析、时间处理、数据清洗
- 🛡️ **企业级安全** - Argon2 密码加密、JWT令牌管理
- 📝 **结构化日志** - Pino日志框架，生产级日志管理
- 🐳 **容器化部署** - Docker + Docker Compose 多环境支持
- 🔄 **数据库迁移** - Prisma ORM 数据库版本管理
- 📡 **RESTful API** - 标准化的API设计和响应格式

## 🏗️ 技术架构

### 后端技术栈

```
├── 🚀 NestJS v11        # Node.js 企业级框架
├── 🗄️ Prisma ORM        # 类型安全的数据库ORM
├── 🐘 PostgreSQL        # 主数据库
├── 🔑 JWT + Passport    # 认证授权
├── 🔒 Argon2           # 密码加密
├── 📝 Pino             # 高性能日志
├── ✅ class-validator   # 数据验证
└── 🐳 Docker           # 容器化部署
```

### 项目结构

```
src/
├── app.module.ts           # 应用主模块
├── main.ts                 # 应用入口点
├── auth/                   # 认证模块
│   ├── guard/              # 路由守卫
│   ├── strategy/           # 认证策略
│   └── services/           # 认证服务
├── users/                  # 用户管理模块
│   ├── user.dao.ts         # 数据访问层
│   ├── user.dto.ts         # 数据传输对象
│   └── users.service.ts    # 业务逻辑层
├── common/                 # 公共模块
│   ├── dto/                # 通用DTO
│   ├── filters/            # 异常过滤器
│   ├── interceptors/       # 拦截器
│   └── helpers/            # 工具函数
└── type/                   # 类型定义
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- pnpm >= 8.x
- PostgreSQL >= 14.x
- Docker & Docker Compose (可选)

### 本地开发

1. **克隆项目**

```bash
git clone <repository-url>
cd service-epg
```

2. **安装依赖**

```bash
pnpm install
```

3. **环境配置**

```bash
# 复制环境配置文件
cp .env.development .env

# 编辑配置文件
nano .env
```

4. **数据库设置**

```bash
# 生成 Prisma 客户端
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate

# 查看数据库（可选）
pnpm run prisma:studio
```

5. **启动开发服务器**

```bash
pnpm run start:dev
```

服务将在 `http://localhost:4000` 启动。

### Docker 部署

#### 开发环境

```bash
# 使用统一管理脚本启动开发环境
./docker-manager.sh development up

# 查看服务状态
./docker-manager.sh development status

# 查看日志
./docker-manager.sh development logs
```

#### 生产环境

```bash
# 配置生产环境变量
cp .env.production .env
# 编辑 .env 文件，设置安全的密码和密钥

# 启动生产环境（包含 Nginx 代理）
./docker-manager.sh production up
```

## 📡 API 文档

### 认证接口

#### 用户登录

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 用户登出

```http
POST /auth/logout
Authorization: Bearer <token>
```

### 用户管理

#### 创建用户

```http
POST /user
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!"
}
```

#### 获取当前用户信息

```http
GET /user/currentUser
Authorization: Bearer <token>
```

#### 批量删除用户

```http
DELETE /user
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["user-id-1", "user-id-2"]
}
```

### 系统接口

#### 健康检查

```http
GET /health
```

**响应:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

#### 应用信息

```http
GET /
```

**响应:**

```json
{
  "message": "EPG Admin Service API"
}
```

#### 版本信息

```http
GET /version
```

**响应:**

```json
{
  "version": "1.0.0",
  "node": "v20.x.x"
}
```

#### 用户资料（需认证）

```http
GET /profile
Authorization: Bearer <token>
```

### EPG数据类型

#### 频道信息 (Channel)

```typescript
interface Channel {
  'display-name': {
    '#text': string;
    lang: string;
  };
  id: number;
}
```

#### 节目信息 (Programme)

```typescript
interface Programme {
  start: string; // EPG时间格式: "20250709004500 +0800"
  stop: string; // EPG时间格式: "20250709014500 +0800"
  channel: number; // 频道ID
  title: {
    '#text': string; // 节目标题
    lang: string; // 语言代码
  };
  desc: {
    lang: string; // 描述语言
  };
}
```

#### EPG XML结构

```typescript
interface EPG_XML {
  tv: {
    channel: Channel[]; // 频道列表
    programme: Programme[]; // 节目列表
  };
}
```

## 🔧 配置说明

### 环境变量

#### 必需配置

```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/epg_db

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your-super-secure-jwt-secret-key

# 应用端口
PORT=4000
NODE_ENV=development
```

#### 可选配置

```bash
# 日志级别
LOG_LEVEL=debug

# PostgreSQL 连接配置
POSTGRES_PASSWORD=epg_password
POSTGRES_PORT=127.0.0.1:5432

# 应用端口映射
APP_PORT=127.0.0.1:4000

# 资源限制
CPU_LIMIT=1.0
MEMORY_LIMIT=1G
```

### Docker 环境配置

#### 开发环境 (.env.development)

- 本地端口绑定，便于调试
- 详细日志输出
- 宽松的资源限制

#### 生产环境 (.env.production)

- 内部网络隔离
- 错误日志收集
- 严格的资源限制
- Nginx 反向代理

## 🛡️ 安全特性

### 认证授权

- **JWT令牌认证** - 基于标准JWT实现
- **令牌黑名单** - 支持令牌撤销和登出
- **角色权限控制** - ADMIN/EDITOR 角色管理

### 密码安全

- **Argon2加密** - 行业标准的密码哈希算法
- **自动重哈希** - 密码参数升级时自动更新
- **强密码策略** - 密码复杂度验证

### 数据安全

- **输入验证** - class-validator 数据校验
- **SQL注入防护** - Prisma ORM 自动防护
- **XSS防护** - 请求头安全设置

## 📊 数据库设计

### 用户表 (User)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password_hash String
  role          UserRole @default(EDITOR)
  hash_algo     String   @default("argon2id")
  hash_meta     Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum UserRole {
  ADMIN
  EDITOR
}
```

## 🔄 开发工作流

### 代码规范

```bash
# 代码格式化
pnpm run format

# 代码检查
pnpm run lint

# 类型检查
pnpm run build
```

### 测试

```bash
# 单元测试
pnpm run test

# 监听模式测试
pnpm run test:watch

# 覆盖率测试
pnpm run test:cov

# E2E测试
pnpm run test:e2e
```

### 数据库操作

```bash
# 生成客户端
pnpm run prisma:generate

# 创建迁移
pnpm run prisma:migrate

# 重置数据库
pnpm db:push

# 数据库管理界面
pnpm run prisma:studio
```

## 🚀 部署指南

### 生产环境部署清单

- [ ] 修改默认密码和JWT密钥
- [ ] 配置SSL证书
- [ ] 设置防火墙规则
- [ ] 配置日志收集
- [ ] 设置监控报警
- [ ] 配置数据库备份
- [ ] 验证健康检查

### 性能优化

1. **数据库优化**
   - 配置连接池
   - 添加适当索引
   - 查询性能监控

2. **应用优化**
   - 启用生产模式
   - 配置缓存策略
   - 资源限制设置

3. **网络优化**
   - Nginx反向代理
   - GZIP压缩
   - 静态资源缓存

## 📝 日志管理

### 日志级别

- `error` - 错误日志
- `warn` - 警告日志
- `info` - 信息日志
- `debug` - 调试日志

### 日志格式

生产环境使用结构化JSON格式，开发环境使用彩色控制台输出。

### 日志文件

- `./logs/error.log` - 错误日志
- `./logs/app.log` - 应用日志

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目使用 UNLICENSED 许可证。

## 📞 支持

如果您有任何问题或建议，请通过以下方式联系：

- 创建 [Issue](../../issues)
- 发送邮件至项目维护者

---

**🎉 感谢使用 EPG Admin Service！**
$ pnpm run test

# e2e tests

$ pnpm run test:e2e

# test coverage

$ pnpm run test:cov

````

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
````

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
