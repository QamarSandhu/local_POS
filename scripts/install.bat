@echo off
setlocal
cd /d "%~dp0.."
echo ======================================================================
echo           Let's Buy It - Windows POS Installer Launcher
echo ======================================================================
echo.

:: Elevate to Administrator if not already elevated
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ELEVATION] Requesting Administrator privileges to install runtime components...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Installation failed or was aborted.
    pause
)
