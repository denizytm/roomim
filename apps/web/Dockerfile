# Roomim web — Next.js 16 (npm workspaces monorepo).
# ÖNEMLİ: build context repo KÖKÜ olmalı:
#   docker build -f apps/web/Dockerfile -t roomim-web \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
#     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://roomim.com .
FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache libc6-compat

# Workspace manifest'leri önce (katman cache)
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

# sharp: alpine'de next/image optimizasyonu için (musl prebuilt)
RUN npm i sharp

# Kaynak
COPY . .

# NEXT_PUBLIC_* build zamanında client bundle'a gömülür → build-arg ŞART
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace @roomim/web

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "@roomim/web"]
