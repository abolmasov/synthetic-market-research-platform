#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==================================================="
echo "  Synthetic Market Research Platform — Local Runner"
echo "==================================================="

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for the Postgres service. Install Docker or set DB_ENABLED=false in backend/.env for in-memory mode only."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js (npm) is required."
  exit 1
fi

echo "[1/5] Starting Postgres (docker compose)..."
docker compose down >/dev/null 2>&1 || true
docker compose up -d

echo "[2/5] Environment files..."
if [[ ! -f backend/.env ]]; then
  cp backend/.env.example backend/.env
  echo "  Created backend/.env (LLM_MODE=mock — no cloud credentials required)"
fi
if [[ ! -f frontend/.env ]]; then
  cp frontend/.env.example frontend/.env
  echo "  Created frontend/.env"
fi

echo "[3/5] Installing dependencies..."
npm ci --prefix backend
npm ci --prefix frontend

echo "[4/5] Starting backend (http://localhost:3003)..."
npm run start:dev --prefix backend &
BACKEND_PID=$!

echo "[5/5] Starting frontend (http://localhost:5175)..."
npm run dev --prefix frontend &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "Stopping servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "  API + Swagger: http://localhost:3003/api"
echo "  UI:            http://localhost:5175"
echo "  Postgres:      localhost:5445 (user smr / password smr)"
echo ""
echo "Press Ctrl+C to stop. Run 'docker compose down' to stop Postgres."
wait
