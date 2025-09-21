#!/bin/bash

# ==========================================
# Docker 构建问题调试脚本
# ==========================================

set -e

echo "🔍 分析 Docker 构建问题..."

# 检查 Dockerfile 中的问题行
echo "📝 检查 Dockerfile 修复..."
if grep -q "pnpm install.*--prod.*--ignore-scripts" Dockerfile; then
    echo "✅ Dockerfile 已修复：生产依赖安装跳过脚本"
else
    echo "❌ Dockerfile 未修复"
    exit 1
fi

# 检查 package.json 中的依赖配置
echo "📦 检查 package.json 依赖配置..."

# 检查 prisma 是否在 devDependencies 中
if grep -A 50 '"devDependencies"' package.json | grep -q '"prisma"'; then
    echo "✅ prisma 在 devDependencies 中"
else
    echo "❌ prisma 不在 devDependencies 中"
fi

# 检查 @prisma/client 是否在 dependencies 中
if grep -A 50 '"dependencies"' package.json | grep -q '"@prisma/client"'; then
    echo "✅ @prisma/client 在 dependencies 中"
else
    echo "❌ @prisma/client 不在 dependencies 中"
fi

echo ""
echo "🛠️  推荐的修复策略："
echo "1. ✅ 在生产依赖安装时跳过 postinstall 脚本 (已实现)"
echo "2. 在构建阶段已经生成了 Prisma Client"
echo "3. 生产阶段不需要 prisma CLI，只需要 @prisma/client"

echo ""
echo "🧪 测试构建流程..."

# 模拟 Docker 构建步骤
echo "Step 1: 安装所有依赖（跳过脚本）"
if pnpm install --ignore-scripts > /dev/null 2>&1; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "Step 2: 生成 Prisma Client"
if pnpm run prisma:generate > /dev/null 2>&1; then
    echo "✅ Prisma Client 生成成功"
else
    echo "❌ Prisma Client 生成失败"
    exit 1
fi

echo "Step 3: 构建应用"
if pnpm run build > /dev/null 2>&1; then
    echo "✅ 应用构建成功"
else
    echo "❌ 应用构建失败"
    exit 1
fi

echo "Step 4: 安装生产依赖（跳过脚本）"
if pnpm install --prod --ignore-scripts > /dev/null 2>&1; then
    echo "✅ 生产依赖安装成功"
else
    echo "❌ 生产依赖安装失败"
    exit 1
fi

echo ""
echo "🎉 所有步骤测试通过！"
echo "💡 Docker 构建现在应该可以成功了。"

# 清理测试产生的文件
echo "🧹 清理测试文件..."
rm -rf node_modules dist generated 2>/dev/null || true

echo "✨ 测试完成！"