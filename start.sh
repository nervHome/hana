#!/bin/bash

# ==========================================
# Docker 快速启动脚本
# ==========================================

set -e

echo "🚀 启动 NestJS + Prisma 应用..."

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件设置实际的环境变量值"
fi

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker build -t service-epg:latest .

# 启动服务
echo "🎯 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查健康状态
echo "🏥 检查应用健康状态..."
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ 应用启动成功！"
    echo "🌐 访问地址: http://localhost:4000"
    echo "📊 健康检查: http://localhost:4000/health"
else
    echo "❌ 应用启动失败，查看日志..."
    docker-compose logs app
fi

echo "📋 使用以下命令查看日志:"
echo "   docker-compose logs -f app"
echo "📋 使用以下命令停止服务:"
echo "   docker-compose down"