@echo off
setlocal
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update.ps1"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Update process encountered an error.
    pause
)
