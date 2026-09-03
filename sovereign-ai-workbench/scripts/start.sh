#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "  SOVEREIGN-AI WORKBENCH (SIH26117) — LINUX / DOCKER LAUNCHER"
echo "  Client: Mangalore Refinery and Petrochemicals Limited (MRPL)"
echo "======================================================================"

cd "$(dirname "$0")/.."

mkdir -p data/documents data/knowledge data/artifacts data/indexes data/workspaces

echo "[1/3] Generating synthetic industrial datasets..."
python3 scripts/create_demo_data.py || true

echo "[2/3] Checking Docker Compose..."
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "Starting services via Docker Compose..."
    docker compose up -d
else
    echo "Starting local Python and Node services..."
    cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &
    cd ../frontend && npm run dev &
fi

echo "======================================================================"
echo "  SUCCESS: SovereignAI Workbench is live at http://localhost:3000"
echo "======================================================================"
