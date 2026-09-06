@echo off
setlocal enabledelayedexpansion
title LUMI Local Multimodal Vision Server (Port 8080)

echo ======================================================================
echo   LUMI MULTIMODAL VISION SERVER (Port 8080)
echo ======================================================================

:: 1. Check if server is already running on port 8080
netstat -ano | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Multimodal vision server is already active on port 8080.
    exit /b 0
)

set "MODEL_PATH=%~dp0..\models\qwen3-vl-8b\Qwen3VL-8B-Instruct-Q4_K_M.gguf"
set "MMPROJ_PATH=%~dp0..\models\qwen3-vl-8b\mmproj-Qwen3VL-8B-Instruct-F16.gguf"

if not exist "!MODEL_PATH!" (
    set "MODEL_PATH=F:\corewithin\models\qwen3-vl-8b\Qwen3VL-8B-Instruct-Q4_K_M.gguf"
)
if not exist "!MMPROJ_PATH!" (
    set "MMPROJ_PATH=F:\corewithin\models\qwen3-vl-8b\mmproj-Qwen3VL-8B-Instruct-F16.gguf"
)

echo Starting llama-server with multimodal vision projector...
echo Model:   !MODEL_PATH!
echo Projector: !MMPROJ_PATH!

llama-server.exe -m "!MODEL_PATH!" --mmproj "!MMPROJ_PATH!" --port 8080 -ngl 99 -c 4096
