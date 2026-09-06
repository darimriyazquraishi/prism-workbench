@echo off
title Stop LUMI Local Inference Engine

echo Stopping local inference engine on port 11434...

:: Find PID on port 11434 and kill it
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":11434" ^| findstr "LISTENING"') do (
    echo Terminating PID %%a listening on port 11434...
    taskkill /F /PID %%a >nul 2>&1
)

:: Terminate ollama processes if still running
taskkill /F /IM ollama.exe >nul 2>&1
taskkill /F /IM llama-server.exe >nul 2>&1

echo [OK] Local inference engine stopped.
exit /b 0
