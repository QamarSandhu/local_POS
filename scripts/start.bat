@echo off
setlocal
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to start Let's Buy It POS services.
    pause
)
