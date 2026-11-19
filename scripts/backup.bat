@echo off
setlocal
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup.ps1"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backup creation failed.
    pause
)
