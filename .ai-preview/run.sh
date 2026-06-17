#!/bin/bash
# Preview 环境启动脚本（Nuxt 3 前端项目）
# 预览用 nuxt dev server 而非 `pnpm build` + `preview`：full build 又重又吃内存，预览 pod 易 OOM/
# 超时 → 「pod 未就绪」(#303 #395 报的 503)。dev server 起得快、省内存，预览环境(非生产)足够。
# 同款思路见 oneid-website 的 .ai-preview/run.sh(oneid-website#2)。
set -e
cd /tmp/app

# 装依赖(node 镜像自带 corepack；兜底全局装 pnpm)
corepack enable 2>/dev/null || npm install -g pnpm
pnpm install --no-frozen-lockfile

# 起 Nuxt dev server，绑 0.0.0.0:$PORT 供 ingress/clusterip 访问；不做 full build，避免 OOM/超时
exec env HOST=0.0.0.0 PORT="${PORT:-8080}" pnpm --filter website dev -- --host 0.0.0.0 --port "${PORT:-8080}"
