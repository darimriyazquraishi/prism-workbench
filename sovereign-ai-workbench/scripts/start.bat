@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo   SOVEREIGN-AI WORKBENCH (SIH26117) — ON-PREMISE AIR-GAPPED LAUNCHER
echo   Client: Mangalore Refinery and Petrochemicals Limited (MRPL)
echo ======================================================================

echo [1/4] Checking Local Environment & Directories...
cd /d "%~dp0\.."
if not exist "data" mkdir data
if not exist "data\documents" mkdir data\documents
if not exist "data\knowledge" mkdir data\knowledge
if not exist "data\artifacts" mkdir data\artifacts
if not exist "data\indexes" mkdir data\indexes
if not exist "data\workspaces" mkdir data\workspaces

echo [2/4] Generating Synthetic Demo Data & Pre-seeding Knowledge Base...
python scripts\create_demo_data.py

echo [3/4] Starting SovereignAI Backend Server (FastAPI on port 8000)...
start "SovereignAI Backend" /min cmd /k "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [4/4] Starting SovereignAI Frontend UI (Port 3000)...
start "SovereignAI Frontend" /min cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo   SUCCESS: SovereignAI Workbench is now operational!
echo   UI Dashboard:  http://localhost:3000
echo   API Docs:      http://localhost:8000/docs
echo   Network Mode:  AIR-GAPPED SOVEREIGN (Zero External Cloud Calls)
echo ======================================================================
pause
