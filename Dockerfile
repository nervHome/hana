# ==========================================
# 统一优化的 Multi-stage Dockerfile for NestJS + Prisma
# 支持开发和生产环境构建
# ==========================================

# 使用官方 Node.js 20 Alpine 镜像作为基础镜像
FROM node:20-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装系统依赖和 pnpm
RUN apk add --no-cache \
    dumb-init \
    && npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# ==========================================
# Dependencies stage - 安装所有依赖
# ==========================================
FROM base AS dependencies

# 安装所有依赖（跳过 postinstall，避免在没有源代码时运行 prisma generate）
RUN pnpm install --frozen-lockfile --ignore-scripts

# ==========================================
# Build stage - 构建应用
# ==========================================
FROM base AS build

# 从 dependencies stage 复制 node_modules
COPY --from=dependencies /app/node_modules ./node_modules

# 复制源代码和配置文件
COPY . .

# 生成 Prisma Client（现在有源代码了）
RUN pnpm run prisma:generate

# 构建 NestJS 应用
RUN pnpm run build

# ==========================================
# Production dependencies stage - 只安装生产依赖
# ==========================================
FROM base AS prod-deps

# 只安装生产依赖（跳过脚本，因为不需要 prisma CLI）
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# ==========================================
# Development stage - 开发环境
# ==========================================
FROM base AS development

# 从 dependencies stage 复制完整的 node_modules
COPY --from=dependencies /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN pnpm run prisma:generate

# 暴露开发端口
EXPOSE 4000

# 启动开发服务器
CMD ["pnpm", "run", "start:dev"]

# ==========================================
# Production stage - 生产环境镜像
# ==========================================
FROM node:20-alpine AS production

# 设置 Node.js 环境为生产模式
ENV NODE_ENV=production

# 安装 dumb-init 用于正确处理信号
RUN apk add --no-cache dumb-init

# 创建非 root 用户提高安全性
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 设置工作目录
WORKDIR /app

# 创建必要的目录并设置权限
RUN mkdir -p logs uploads && \
    chown -R nestjs:nodejs logs uploads

# 从 build stage 复制构建产物
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

# 从 prod-deps stage 复制生产依赖
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# 复制 Prisma 生成的客户端和 schema
COPY --from=build --chown=nestjs:nodejs /app/generated ./generated
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

# 切换到非 root 用户
USER nestjs

# 暴露应用端口
EXPOSE 4000

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node dist/health-check.js || exit 1

# 使用 dumb-init 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]