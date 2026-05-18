# syntax=docker/dockerfile:1.7
# Universal Dockerfile for any shop instance in the DemiCommerce monorepo.
# Build args:
#   APP_NAME   - workspace package name (e.g. @garden-smile-uk/web)
#   APP_PORT   - container listen port (default 3000)

ARG NODE_VERSION=22

# === BASE ===
FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable \
 && apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# === DEPS ===
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY modules/ modules/
COPY packages/ packages/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --no-frozen-lockfile --reporter=append-only

# Patch @payloadcms/db-postgres to force push:true regardless of NODE_ENV.
# Next webpack inlines process.env.NODE_ENV='production' at build time, which
# disables schema push. We rewrite the condition to always allow push.
RUN find /app -path '*/@payloadcms/db-postgres/dist/connect.js' -exec \
    sed -i "s|process\\.env\\.NODE_ENV !== 'production'|true|g" {} +

# === BUILDER ===
FROM base AS builder
ARG APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/modules ./modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter "$APP_NAME" build

# === RUNNER ===
FROM base AS runner
ARG APP_NAME
ARG APP_PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=$APP_PORT
ENV HOSTNAME=0.0.0.0
ENV APP_NAME=$APP_NAME

COPY --from=builder /app /app
EXPOSE $APP_PORT
WORKDIR /app/apps/web
CMD ["sh", "-c", "pnpm exec next start -H 0.0.0.0 -p $PORT"]
