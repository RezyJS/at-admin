# syntax=docker.io/docker/dockerfile:1

FROM node:23-alpine AS base

WORKDIR /app

# Enable corepack
RUN corepack enable

# ===== Builder Stage =====
FROM base AS builder

# Copy lock files FIRST
COPY pnpm-lock.yaml package.json .npmrc* ./

# PNPM install
RUN pnpm install --frozen-lockfile

# Copy rest and build
COPY . .
RUN pnpm build

# ===== Runner Stage =====
FROM base AS runner

WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -u 1001 -S nextjs -G nodejs
USER nextjs

# Copy built artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

# PNPM-specific start command
CMD ["node", "server.js"]
