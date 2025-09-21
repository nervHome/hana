# ==========================================
# Makefile for Docker operations
# ==========================================

# 变量定义
DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE_PROD_FILE = docker-compose.prod.yml
APP_NAME = epg-app
IMAGE_NAME = service-epg
TAG ?= latest

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
.PHONY: help
help: ## 显示帮助信息
	@echo "可用的命令:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# 开发环境命令
.PHONY: dev-build
dev-build: ## 构建开发环境
	docker-compose -f $(DOCKER_COMPOSE_FILE) build

.PHONY: dev-up
dev-up: ## 启动开发环境
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d

.PHONY: dev-down
dev-down: ## 停止开发环境
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: dev-logs
dev-logs: ## 查看开发环境日志
	docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f

.PHONY: dev-restart
dev-restart: ## 重启开发环境
	docker-compose -f $(DOCKER_COMPOSE_FILE) restart

# 生产环境命令
.PHONY: prod-build
prod-build: ## 构建生产环境
	docker-compose -f $(DOCKER_COMPOSE_PROD_FILE) build

.PHONY: prod-up
prod-up: ## 启动生产环境
	docker-compose -f $(DOCKER_COMPOSE_PROD_FILE) up -d

.PHONY: prod-down
prod-down: ## 停止生产环境
	docker-compose -f $(DOCKER_COMPOSE_PROD_FILE) down

.PHONY: prod-logs
prod-logs: ## 查看生产环境日志
	docker-compose -f $(DOCKER_COMPOSE_PROD_FILE) logs -f

# 数据库操作
.PHONY: db-migrate
db-migrate: ## 运行数据库迁移
	docker-compose -f $(DOCKER_COMPOSE_FILE) exec app pnpm run prisma:migrate

.PHONY: db-seed
db-seed: ## 运行数据库种子
	docker-compose -f $(DOCKER_COMPOSE_FILE) exec app pnpm run prisma:seed

.PHONY: db-studio
db-studio: ## 启动 Prisma Studio
	docker-compose -f $(DOCKER_COMPOSE_FILE) exec app pnpm run prisma:studio

.PHONY: db-reset
db-reset: ## 重置数据库
	docker-compose -f $(DOCKER_COMPOSE_FILE) exec app pnpm run prisma:reset

# 清理命令
.PHONY: clean
clean: ## 清理 Docker 资源
	docker system prune -f
	docker volume prune -f

.PHONY: clean-all
clean-all: ## 清理所有 Docker 资源 (危险操作)
	docker system prune -a -f
	docker volume prune -f

# 镜像操作
.PHONY: build-image
build-image: ## 构建 Docker 镜像
	docker build -t $(IMAGE_NAME):$(TAG) .

.PHONY: push-image
push-image: ## 推送镜像到仓库
	docker push $(IMAGE_NAME):$(TAG)

# 进入容器
.PHONY: shell
shell: ## 进入应用容器
	docker-compose -f $(DOCKER_COMPOSE_FILE) exec app sh

.PHONY: db-shell
db-shell: ## 进入数据库容器
	docker-compose -f $(DOCKER_COMPOSE_FILE) exec postgres psql -U epg_user -d epg_db

# 健康检查
.PHONY: health
health: ## 检查应用健康状态
	curl -f http://localhost:4000/health || echo "应用不健康"

# 监控
.PHONY: stats
stats: ## 显示容器资源使用情况
	docker stats

.PHONY: ps
ps: ## 显示运行中的容器
	docker-compose -f $(DOCKER_COMPOSE_FILE) ps