# Studfy core API (NestJS) — multi-stage
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages ./packages
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS build
COPY --from=deps /app ./
COPY . .
RUN pnpm --filter @studfy/api prisma generate && pnpm --filter @studfy/api build

FROM base AS run
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4001
CMD ["node", "apps/api/dist/main.js"]
