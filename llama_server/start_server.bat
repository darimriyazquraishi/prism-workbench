@echo off
setlocal enabledelayedexpansion
title LUMI Local Llama/Ollama Inference Engine

echo ======================================================================
echo   LUMI LOCAL INFERENCE SERVER
echo ======================================================================
echo.

:: 1. Check if server is already running on port 11434
netstat -ano | findstr ":11434 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Local inference engine is already active and listening on port 11434.
    exit /b 0
)

echo Port 11434 is idle. Starting local engine...

:: 2. Check local folder for ollama.exe
if exist "%~dp0ollama.exe" (
    echo Launching bundled engine: "%~dp0ollama.exe" serve
    "%~dp0ollama.exe" serve
    exit /b 0
)

:: 3. Check user AppData folder
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
    echo Launching system engine: "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve
    "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve
    exit /b 0
)

:: 4. Check system PATH
where ollama >nul 2>&1
if %errorlevel% equ 0 (
    echo Launching PATH engine: ollama serve
    ollama serve
    exit /b 0
)

:: 5. Fallback: check for llama-server.exe
if exist "%~dp0llama-server.exe" (
    echo Launching llama-server on port 11434...
    "%~dp0llama-server.exe" --port 11434 --host 127.0.0.1
    exit /b 0
)

echo [ERROR] Could not find ollama.exe or llama-server.exe.
echo Please ensure Ollama or llama-server is installed.
pause
exit /b 1
