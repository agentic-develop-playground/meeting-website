#!/bin/bash
# Preview 环境启动脚本（Nuxt 3 前端项目）
set -e
cd /tmp/app

# 装依赖
npm install -g pnpm
pnpm install --no-frozen-lockfile

# 构建
pnpm build

# 启动 preview 服务
exec pnpm --filter website preview --hostname 0.0.0.0 --port ${PORT:-8080}
