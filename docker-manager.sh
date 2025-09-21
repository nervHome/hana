#!/bin/bash

# ==========================================
# Docker Compose 管理脚本
# ==========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认环境
ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"

# 函数：显示帮助信息
show_help() {
    echo -e "${BLUE}Docker Compose 管理脚本${NC}"
    echo ""
    echo "用法: $0 [环境] [命令] [选项]"
    echo ""
    echo "环境:"
    echo "  development  开发环境 (默认)"
    echo "  production   生产环境"
    echo ""
    echo "命令:"
    echo "  up           启动服务"
    echo "  down         停止服务"
    echo "  build        构建镜像"
    echo "  logs         查看日志"
    echo "  status       查看状态"
    echo "  clean        清理资源"
    echo "  shell        进入应用容器"
    echo ""
    echo "示例:"
    echo "  $0 development up     # 启动开发环境"
    echo "  $0 production up      # 启动生产环境"
    echo "  $0 development build  # 构建开发环境镜像"
}

# 函数：设置环境
setup_environment() {
    case $ENVIRONMENT in
        development|dev)
            echo -e "${YELLOW}🚀 使用开发环境配置${NC}"
            export ENV_FILE=".env.development"
            export COMPOSE_PROFILES=""
            ;;
        production|prod)
            echo -e "${GREEN}🚀 使用生产环境配置${NC}"
            export ENV_FILE=".env.production"
            export COMPOSE_PROFILES="nginx,production"
            ;;
        *)
            echo -e "${RED}❌ 不支持的环境: $ENVIRONMENT${NC}"
            echo "支持的环境: development, production"
            exit 1
            ;;
    esac
}

# 函数：执行 docker-compose 命令
run_compose() {
    local cmd="docker-compose"
    
    if [ -f "$ENV_FILE" ]; then
        cmd="$cmd --env-file $ENV_FILE"
    fi
    
    if [ ! -z "$COMPOSE_PROFILES" ]; then
        cmd="$cmd --profile $(echo $COMPOSE_PROFILES | tr ',' ' --profile ')"
    fi
    
    cmd="$cmd -f $COMPOSE_FILE"
    
    echo -e "${BLUE}执行: $cmd $@${NC}"
    eval "$cmd $@"
}

# 函数：启动服务
start_services() {
    echo -e "${GREEN}🚀 启动服务...${NC}"
    run_compose up -d
    
    echo -e "\n${YELLOW}📊 服务状态:${NC}"
    run_compose ps
    
    echo -e "\n${GREEN}✅ 服务启动完成${NC}"
    if [ "$ENVIRONMENT" = "development" ]; then
        echo -e "${BLUE}💡 应用访问地址: http://localhost:4000${NC}"
    else
        echo -e "${BLUE}💡 应用访问地址: http://localhost${NC}"
    fi
}

# 函数：停止服务
stop_services() {
    echo -e "${YELLOW}🛑 停止服务...${NC}"
    run_compose down
    echo -e "${GREEN}✅ 服务已停止${NC}"
}

# 函数：构建镜像
build_images() {
    echo -e "${BLUE}🔨 构建镜像...${NC}"
    run_compose build
    echo -e "${GREEN}✅ 镜像构建完成${NC}"
}

# 函数：查看日志
show_logs() {
    local service=$3
    if [ -z "$service" ]; then
        run_compose logs -f
    else
        run_compose logs -f "$service"
    fi
}

# 函数：查看状态
show_status() {
    echo -e "${BLUE}📊 服务状态:${NC}"
    run_compose ps
    
    echo -e "\n${BLUE}📊 卷状态:${NC}"
    docker volume ls | grep "$(basename $(pwd))"
    
    echo -e "\n${BLUE}📊 网络状态:${NC}"
    docker network ls | grep "$(basename $(pwd))"
}

# 函数：清理资源
clean_resources() {
    echo -e "${YELLOW}🧹 清理资源...${NC}"
    
    read -p "是否要删除所有容器、卷和网络? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        run_compose down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ 资源清理完成${NC}"
    else
        echo -e "${BLUE}ℹ️  取消清理操作${NC}"
    fi
}

# 函数：进入容器
enter_shell() {
    local service=${3:-app}
    echo -e "${BLUE}🐚 进入 $service 容器...${NC}"
    run_compose exec "$service" sh
}

# 主逻辑
main() {
    # 检查参数
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        show_help
        exit 0
    fi
    
    # 设置环境
    setup_environment
    
    # 执行命令
    case ${2:-up} in
        up|start)
            start_services
            ;;
        down|stop)
            stop_services
            ;;
        build)
            build_images
            ;;
        logs)
            show_logs $@
            ;;
        status|ps)
            show_status
            ;;
        clean)
            clean_resources
            ;;
        shell|sh)
            enter_shell $@
            ;;
        *)
            echo -e "${RED}❌ 不支持的命令: ${2:-up}${NC}"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main $@