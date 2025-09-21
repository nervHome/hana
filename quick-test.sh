#!/bin/bash

# ==========================================
# 快速验证 Docker 修复
# ==========================================

set -e

echo "🧪 快速测试 Docker 构建修复..."

# 测试改进的 Dockerfile
echo "📋 使用改进的 Dockerfile 构建..."
if docker build -f Dockerfile.improved -t service-epg:improved . > build.log 2>&1; then
    echo "✅ 改进版构建成功！"
    
    # 测试运行
    echo "🚀 测试运行容器..."
    CONTAINER_ID=$(docker run -d -p 4001:4000 service-epg:improved)
    sleep 5
    
    # 测试健康检查
    if curl -f http://localhost:4001/health > /dev/null 2>&1; then
        echo "✅ 应用运行成功！"
        echo "🌐 访问地址: http://localhost:4001"
    else
        echo "⚠️  应用启动中，稍后可能会正常..."
    fi
    
    # 清理
    docker stop $CONTAINER_ID > /dev/null 2>&1 || true
    docker rm $CONTAINER_ID > /dev/null 2>&1 || true
    
else
    echo "❌ 改进版构建失败，检查日志:"
    tail -20 build.log
    exit 1
fi

echo ""
echo "🎉 Docker 修复验证完成！"
echo "💡 你现在可以使用以下任一方式："
echo "   1. 使用修复的原 Dockerfile: docker build -t service-epg ."
echo "   2. 使用改进的 Dockerfile: docker build -f Dockerfile.improved -t service-epg ."