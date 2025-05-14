# syntax=docker.io/docker/dockerfile:1

FROM node:23-alpine AS base

WORKDIR /app

# Enable corepack (official way to manage pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate

# ===== Builder Stage =====
FROM base AS builder

# Copy lock files FIRST (speed hack)
COPY pnpm-lock.yaml package.json .npmrc* ./

# PNPM install (--frozen-lockfile = zero surprises)
RUN pnpm install --frozen-lockfile

COPY public/ public

# Copy rest and build
COPY . .
RUN pnpm build

# ===== Runner Stage =====
FROM base AS runner

WORKDIR /app

# Non-root user (security flex)
RUN addgroup -g 1001 -S nodejs && \
  adduser -u 1001 -S nextjs -G nodejs
USER nextjs

# Copy built artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# PNPM-specific start command
CMD ["node", "server.js"]
