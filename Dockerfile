FROM node:22-slim

# Prisma's query engine needs OpenSSL on the slim images.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Manifests first so `npm ci` stays cached across source-only changes.
# The prisma schema is copied too: packages/database has a postinstall that
# runs `prisma generate`.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/database/prisma packages/database/prisma

RUN npm ci

COPY . .

RUN npm run build:api

ENV NODE_ENV=production
EXPOSE 3011

# Migrations are applied at boot so a fresh database is usable immediately.
CMD ["npm", "run", "start:api"]
