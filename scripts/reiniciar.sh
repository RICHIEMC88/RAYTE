#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="prod"
if [[ "${1:-}" == "--dev" ]]; then
  MODE="dev"
fi

export DATABASE_URL="${DATABASE_URL:-postgres://zappy:zappy@127.0.0.1:5432/zappy}"

if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  echo "==> PostgreSQL no está instalado. Instalando..."
  sudo apt-get update
  sudo apt-get install -y postgresql
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm no está disponible" >&2
  exit 1
fi

echo "==> Iniciando PostgreSQL"
sudo pg_ctlcluster 17 main start >/dev/null 2>&1 || true

if ! command -v psql >/dev/null 2>&1; then
  export PATH="/usr/lib/postgresql/17/bin:$PATH"
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='zappy'" | grep -q 1; then
  echo "==> Creando rol zappy"
  sudo -u postgres psql -c "CREATE ROLE zappy LOGIN PASSWORD 'zappy' SUPERUSER"
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='zappy'" | grep -q 1; then
  echo "==> Creando base zappy"
  sudo -u postgres psql -c "CREATE DATABASE zappy OWNER zappy"
fi

if [[ ! -d node_modules ]]; then
  echo "==> Instalando dependencias"
  npm ci
fi

echo "==> Sincronizando esquema"
npm run db:push -- --force

echo "==> Sembrando datos"
npm run db:seed
npx tsx src/db/seed-extras.ts
npx tsx src/db/seed-options.ts
npx tsx src/db/seed-partners.ts
npx tsx src/db/seed-combos.ts
npx tsx src/db/seed-parrilladas.ts

if [[ "$MODE" == "dev" ]]; then
  echo "==> Arrancando en desarrollo"
  exec npm run dev
else
  echo "==> Compilando"
  npm run build
  echo "==> Arrancando en producción"
  exec npm run start
fi
