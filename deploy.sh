#!/bin/bash
set -e

echo "🚀 TierMate 部署脚本"

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker compose down
docker compose build --no-cache
docker compose up -d

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 运行数据库迁移
echo "📦 运行数据库迁移..."
docker compose exec -T api npx prisma db push

echo "✅ 部署完成！"
echo "🌐 API 地址: http://$(curl -s ifconfig.me):3001"
echo "📚 API 文档: http://$(curl -s ifconfig.me):3001/api/docs"
