@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo   BUILDING LUMI / PRISM WORKBENCH STANDALONE EXECUTABLE (.EXE)
echo ======================================================================

cd /d "%~dp0\.."

echo [1/3] Building Web Application with Astro...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Astro build failed.
    pause
    exit /b %errorlevel%
)

echo [2/3] Compiling Native Windows Executable (csc.exe)...
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo Error: C# compiler not found at %CSC%
    pause
    exit /b 1
)

"%CSC%" /nologo /target:winexe /optimize+ /out:LUMI.exe /win32icon:public\favicon.ico /r:System.dll,System.Drawing.dll,System.Windows.Forms.dll,System.Core.dll launcher\LUMI.cs

if %errorlevel% neq 0 (
    echo Error: C# compilation failed.
    pause
    exit /b %errorlevel%
)

echo [3/3] Creating PrismWorkbench.exe alias...
copy /Y LUMI.exe PrismWorkbench.exe >nul

echo.
echo ======================================================================
echo   SUCCESS: Executable created successfully!
echo   Location: %CD%\LUMI.exe
echo   Alias:    %CD%\PrismWorkbench.exe
echo.
echo   All files and folders remain available alongside LUMI.exe.
echo   Double-click LUMI.exe to launch the desktop application.
echo ======================================================================
pause
