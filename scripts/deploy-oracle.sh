#!/usr/bin/env bash
# Run ON the Oracle VM after cloning the repo.
# Usage:
#   cp .env.production.example .env.production   # then fill secrets
#   bash scripts/deploy-oracle.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.production ]]; then
  echo "Missing .env.production — copy .env.production.example and fill Neon + JWT values."
  exit 1
fi

echo ">> Building image…"
docker build -t serviceit-api .

echo ">> Restarting container…"
docker rm -f serviceit-api 2>/dev/null || true
docker run -d --name serviceit-api --restart unless-stopped \
  -p 3011:3011 \
  --env-file .env.production \
  serviceit-api

echo ">> Waiting for health…"
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:3011/health" >/dev/null 2>&1; then
    curl -fsS "http://127.0.0.1:3011/health"
    echo
    echo "OK — API is up on port 3011"
    exit 0
  fi
  sleep 2
done

echo "Health check failed — see: docker logs serviceit-api"
docker logs --tail 80 serviceit-api || true
exit 1
