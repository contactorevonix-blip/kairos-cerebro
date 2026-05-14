# syntax=docker/dockerfile:1.7
# ============================================
# Kairos Check — Production Image
# Multi-stage, node:20-alpine, zero-dep ethos.
# ============================================

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund


FROM node:20-alpine AS runtime
WORKDIR /app

# tini = proper signal handling (PID 1 reaping); curl = HEALTHCHECK probe
RUN apk add --no-cache curl tini

# Production dependencies only (stripe + resend)
COPY --from=deps /app/node_modules ./node_modules

# Application source
COPY bin ./bin
COPY packages ./packages
COPY package.json ./

# Volume mount point for persistent state (DB + vault + audit chain).
# Railway mounts the persistent volume here at runtime.
RUN mkdir -p /app/.kairos-data

ENV NODE_ENV=production \
    PORT=8787 \
    KAIROS_DB_DIR=/app/.kairos-data \
    KAIROS_VAULT_DIR=/app/.kairos-data

EXPOSE 8787

# Deep health probe: covers dbWritable + auditChain.valid + vaultInitialized.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsSL http://127.0.0.1:8787/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/sniper-api/server.js"]
