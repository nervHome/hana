# � Docker 统一配置管理指南

## 概述

本项目已合并所有 Docker 配置文件，通过环境变量和 profiles 支持多环境部署，提供统一的管理体验。

## � 文件结构

```
├── Dockerfile                 # 统一的多阶段构建文件
├── docker-compose.yml         # 统一的 Compose 配置
├── docker-manager.sh          # 管理脚本
├── .env.development           # 开发环境配置
├── .env.production            # 生产环境配置
├── nginx-internal.conf        # Nginx 配置
└── DOCKER_SECURITY.md         # 本文档
```

## 🛡️ 安全级别配置

### 开发环境 (development)

```bash
# 启动开发环境
./docker-manager.sh development up
```

**特点**:

- App: 绑定到 `127.0.0.1:4000` (本地访问)
- PostgreSQL: 绑定到 `127.0.0.1:5432` (本地访问)
- 不启用 Nginx 代理
- 资源限制宽松

### 生产环境 (production)

```bash
# 启动生产环境
./docker-manager.sh production up
```

**特点**:

- App: 仅内部网络访问 (expose: 4000)
- PostgreSQL: 仅内部网络访问 (expose: 5432)
- 启用 Nginx 反向代理
- 严格的资源限制

## 🚀 快速开始

### 1. 开发环境

```bash
# 复制开发环境配置
cp .env.development .env

# 启动开发环境
./docker-manager.sh development up

# 访问应用
curl http://localhost:4000
```

### 2. 生产环境

```bash
# 配置生产环境变量
cp .env.production .env
# 编辑 .env 文件，设置安全的密码和密钥

# 启动生产环境
./docker-manager.sh production up

# 通过 Nginx 访问
curl http://localhost
```

## 🔧 管理命令

```bash
# 显示帮助
./docker-manager.sh --help

# 开发环境操作
./docker-manager.sh development up        # 启动
./docker-manager.sh development down      # 停止
./docker-manager.sh development build     # 构建
./docker-manager.sh development logs      # 查看日志
./docker-manager.sh development status    # 查看状态
./docker-manager.sh development shell     # 进入容器

# 生产环境操作
./docker-manager.sh production up         # 启动
./docker-manager.sh production down       # 停止
./docker-manager.sh production logs       # 查看日志
```

## ⚙️ 环境变量配置

### 应用配置

```bash
NODE_ENV=development|production    # 环境模式
PORT=4000                         # 应用端口
APP_PORT=127.0.0.1:4000          # 端口映射（开发环境）
```

### 数据库配置

```bash
POSTGRES_PASSWORD=your-password    # 数据库密码
POSTGRES_PORT=127.0.0.1:5432     # 端口映射（开发环境）
```

### 安全配置

```bash
JWT_SECRET=your-jwt-secret         # JWT 密钥
SSL_CERT_PATH=/path/to/ssl        # SSL 证书路径
```

### 资源限制

```bash
CPU_LIMIT=1.0                     # CPU 限制
MEMORY_LIMIT=1G                   # 内存限制
CPU_RESERVATION=0.5               # CPU 预留
MEMORY_RESERVATION=512M           # 内存预留
```

### 网络配置

```bash
NETWORK_INTERNAL=false            # 是否启用内部网络
NETWORK_SUBNET=172.20.0.0/16     # 网络子网
```

## 🏗️ Dockerfile 特性

### 多阶段构建

```dockerfile
FROM node:20-alpine AS base       # 基础阶段
FROM base AS dependencies         # 依赖安装
FROM base AS build                # 应用构建
FROM base AS prod-deps            # 生产依赖
FROM base AS development          # 开发环境
FROM node:20-alpine AS production # 生产环境
```

### 安全特性

- ✅ 非 root 用户运行
- ✅ dumb-init 信号处理
- ✅ 最小化镜像体积
- ✅ 健康检查配置
- ✅ 资源限制支持

## 🌐 网络架构

### 开发环境网络

```
Host:4000 → App Container:4000
Host:5432 → PostgreSQL Container:5432
```

### 生产环境网络

```
Host:80 → Nginx Container:80 → App Container:4000
                             ↳ PostgreSQL Container:5432 (内部)
```

## 📊 监控和调试

### 查看服务状态

```bash
./docker-manager.sh development status
```

### 查看日志

```bash
# 所有服务日志
./docker-manager.sh development logs

# 特定服务日志
./docker-manager.sh development logs app
./docker-manager.sh development logs postgres
```

### 进入容器调试

```bash
./docker-manager.sh development shell app
./docker-manager.sh development shell postgres
```

## 🔒 生产环境安全清单

- [ ] 修改默认密码 (`POSTGRES_PASSWORD`, `JWT_SECRET`)
- [ ] 配置 SSL 证书路径 (`SSL_CERT_PATH`)
- [ ] 启用网络隔离 (`NETWORK_INTERNAL=true`)
- [ ] 配置防火墙规则
- [ ] 定期更新基础镜像
- [ ] 配置日志收集和监控
- [ ] 备份数据卷策略

## � 故障排除

### 端口冲突

```bash
# 检查端口占用
netstat -tlnp | grep :4000
netstat -tlnp | grep :5432

# 修改端口配置
# 编辑 .env 文件中的 APP_PORT 和 POSTGRES_PORT
```

### 容器启动失败

```bash
# 查看详细日志
./docker-manager.sh development logs

# 重新构建镜像
./docker-manager.sh development build
```

### 网络连接问题

```bash
# 检查网络状态
docker network ls
docker network inspect epg-network

# 重启网络
./docker-manager.sh development down
./docker-manager.sh development up
```

## 📋 最佳实践

1. **环境隔离**: 使用不同的 `.env` 文件管理环境配置
2. **资源限制**: 生产环境设置合理的 CPU 和内存限制
3. **安全配置**: 定期轮换密钥和密码
4. **监控日志**: 配置日志聚合和报警系统
5. **备份策略**: 定期备份数据卷和配置文件
6. **更新策略**: 定期更新基础镜像和依赖包
