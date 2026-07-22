# Dockerfile do frontend (@portal/root) — monorepo pnpm + Next.js standalone.
#
# IMPORTANTE: o contexto de build é a RAIZ deste repo (frontend/), não apps/root,
# porque o `next build` consome os `packages/*` direto da fonte (main: ./src).
#   docker build -t portal-frontend .      (a partir de frontend/)
#
# Base Debian slim (não Alpine) de propósito: o `sharp` (otimização de imagem do
# Next) usa binário pré-compilado para glibc; em musl/Alpine ele daria dor.

# ---- deps: instala dependências numa camada cacheável (só manifests) ----------
FROM node:22-slim AS deps
RUN corepack enable
WORKDIR /app

# Copiar só os manifests primeiro: enquanto nenhum package.json mudar, esta
# camada (o pnpm install pesado) é reaproveitada do cache mesmo que o código mude.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/root/package.json ./apps/root/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/core/package.json ./packages/core/
COPY packages/checklist/package.json ./packages/checklist/
COPY packages/comunicados/package.json ./packages/comunicados/
COPY packages/mapa-salas/package.json ./packages/mapa-salas/
RUN pnpm install --frozen-lockfile

# ---- builder: traz o código e roda o next build -------------------------------
FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# @portal/* são consumidos da fonte e não têm build próprio → um único next build.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @portal/root build

# ---- runner: só o standalone, imagem final enxuta ----------------------------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuário sem privilégios.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Os TRÊS artefatos que o standalone exige (esquecer static/public = página em
# branco): o server + node_modules podado, os assets estáticos e o /public.
# Com outputFileTracingRoot na raiz do workspace, o standalone espelha o layout
# do monorepo — o entrypoint fica em apps/root/server.js.
COPY --from=builder --chown=nextjs:nodejs /app/apps/root/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/root/.next/static ./apps/root/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/root/public ./apps/root/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/root/server.js"]
