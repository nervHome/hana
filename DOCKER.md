# Docker 部署指南

本项目包含了完整的 Docker 化配置，支持 NestJS + Prisma + PostgreSQL 的容器化部署。

## 📁 Docker 相关文件

- `Dockerfile` - 多阶段构建的生产就绪镜像
- `docker-compose.yml` - 开发环境配置
- `docker-compose.prod.yml` - 生产环境配置
- `nginx.conf` - Nginx 反向代理配置
- `.dockerignore` - Docker 构建忽略文件
- `Makefile` - 便捷的 Docker 操作命令

## 🚀 快速开始

### 开发环境

```bash
# 构建并启动开发环境
make dev-build
make dev-up

# 或者直接使用 docker-compose
docker-compose up --build -d
```

### 生产环境

```bash
# 构建并启动生产环境
make prod-build
make prod-up

# 或者直接使用 docker-compose
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔧 常用命令

### 开发环境操作

```bash
make dev-up          # 启动开发环境
make dev-down        # 停止开发环境
make dev-logs        # 查看日志
make dev-restart     # 重启服务
```

### 数据库操作

```bash
make db-migrate      # 运行数据库迁移
make db-seed         # 运行数据库种子
make db-studio       # 启动 Prisma Studio
make db-reset        # 重置数据库
```

### 容器管理

```bash
make shell           # 进入应用容器
make db-shell        # 进入数据库容器
make health          # 检查应用健康状态
make stats           # 查看容器资源使用
```

## 🏗️ Dockerfile 特性

### 多阶段构建

1. **Base Stage**: 设置基础环境和工作目录
2. **Dependencies Stage**: 安装所有依赖
3. **Build Stage**: 构建应用和生成 Prisma Client
4. **Production Stage**: 优化的生产环境镜像

### 安全特性

- 使用非 root 用户运行应用
- Alpine Linux 基础镜像，减少攻击面
- 只包含生产依赖，减小镜像体积
- 健康检查配置

### 性能优化

- Docker 层缓存优化
- 多阶段构建减小最终镜像
- pnpm 包管理器，更快的安装速度
- .dockerignore 减少构建上下文

## 📊 服务组件

### 应用服务 (app)

- **端口**: 4000
- **环境**: NODE_ENV=production
- **健康检查**: `/health` 端点
- **资源限制**: 1 CPU, 1GB 内存

### 数据库服务 (postgres)

- **端口**: 5432
- **数据库**: epg_db
- **用户**: epg_user
- **数据持久化**: Docker volume

### 缓存服务 (redis)

- **端口**: 6379
- **数据持久化**: Docker volume
- **配置**: AOF 持久化模式

### 反向代理 (nginx)

- **端口**: 80/443
- **功能**: 负载均衡、SSL 终止、静态文件服务
- **安全头**: 自动添加安全响应头

## 🔒 环境变量

### 必需的环境变量

```bash
DATABASE_URL=postgresql://epg_user:epg_password@postgres:5432/epg_db
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
NODE_ENV=production
```

### 可选的环境变量

```bash
REDIS_URL=redis://redis:6379
LOG_LEVEL=info
```

## 🎯 生产部署建议

### 1. 环境变量管理

```bash
# 创建 .env 文件 (不要提交到 Git)
cp .env.example .env
```

### 2. SSL 证书

```bash
# 将 SSL 证书放置在 ssl 目录
mkdir ssl
# 复制你的证书文件
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### 3. 数据备份

```bash
# 定期备份数据库
docker-compose exec postgres pg_dump -U epg_user epg_db > backup.sql
```

### 4. 监控和日志

```bash
# 查看应用日志
docker-compose logs -f app

# 查看系统资源
docker stats
```

## 🚨 故障排除

### 端口占用

```bash
# 检查端口使用情况
lsof -i :4000
netstat -tulpn | grep :4000
```

### 容器重启

```bash
# 重启特定服务
docker-compose restart app

# 重启所有服务
docker-compose restart
```

### 清理资源

```bash
# 清理无用的 Docker 资源
make clean

# 危险操作：清理所有资源
make clean-all
```

### 健康检查失败

```bash
# 手动检查健康状态
curl http://localhost:4000/health

# 查看详细日志
docker-compose logs app
```

## 📈 性能调优

### 1. 数据库连接池

在生产环境中调整 Prisma 连接池大小：

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 在环境变量中设置连接池
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
```

### 2. Node.js 优化

```bash
# 设置 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=1024"
```

### 3. Nginx 缓存

启用 Nginx 缓存以提高性能：

```nginx
# 在 nginx.conf 中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m inactive=60m;
proxy_cache app_cache;
```

## 🔗 相关链接

- [NestJS 官方文档](https://nestjs.com/)
- [Prisma 官方文档](https://prisma.io/)
- [Docker 最佳实践](https://docs.docker.com/develop/best-practices/)
- [PostgreSQL Docker 镜像](https://hub.docker.com/_/postgres)
