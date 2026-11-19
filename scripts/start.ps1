# ==============================================================================
# Let's Buy It - Windows Service Launcher (start.ps1)
# Starts API Backend and Next.js Frontend in Background
# ==============================================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir = Split-Path -Parent $ScriptDir

# Ensure logs directory exists
$LogsDir = Join-Path $InstallDir "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          Let's Buy It - Starting POS Services (Windows)              " -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

# 1. Start NestJS Backend API (Port 3001)
$apiPortInUse = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($apiPortInUse) {
    Write-Host "  [i] API Backend is already running on port 3001 (PID: $($apiPortInUse.OwningProcess[0]))" -ForegroundColor Yellow
} else {
    Write-Host "  -> Starting API Backend Server on port 3001..." -ForegroundColor White
    $apiLog = Join-Path $LogsDir "api.log"
    $apiErrLog = Join-Path $LogsDir "api-error.log"

    $apiProcess = Start-Process -FilePath "node" `
        -ArgumentList "api/dist/src/main.js" `
        -WorkingDirectory $InstallDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput $apiLog `
        -RedirectStandardError $apiErrLog `
        -PassThru

    Start-Sleep -Seconds 2
    if ($apiProcess.HasExited) {
        Write-Host "  [!] API Backend failed to start. Check $apiErrLog for details." -ForegroundColor Red
    } else {
        Write-Host "  ✓ API Backend started successfully (PID: $($apiProcess.Id))" -ForegroundColor Green
    }
}

# 2. Start Next.js Frontend Web (Port 3000)
$webPortInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($webPortInUse) {
    Write-Host "  [i] Frontend Web is already running on port 3000 (PID: $($webPortInUse.OwningProcess[0]))" -ForegroundColor Yellow
} else {
    Write-Host "  -> Starting Frontend Web Application on port 3000..." -ForegroundColor White
    $webLog = Join-Path $LogsDir "web.log"
    $webErrLog = Join-Path $LogsDir "web-error.log"

    $webScript = Join-Path $InstallDir "web\apps\web\server.js"
    if (-not (Test-Path $webScript)) {
        $webScript = Join-Path $InstallDir "web\server.js"
    }

    $webProcess = Start-Process -FilePath "node" `
        -ArgumentList "$webScript" `
        -WorkingDirectory $InstallDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput $webLog `
        -RedirectStandardError $webErrLog `
        -PassThru

    Start-Sleep -Seconds 2
    if ($webProcess.HasExited) {
        Write-Host "  [!] Frontend Web failed to start. Check $webErrLog for details." -ForegroundColor Red
    } else {
        Write-Host "  ✓ Frontend Web started successfully (PID: $($webProcess.Id))" -ForegroundColor Green
    }
}

# 3. Health Check
Start-Sleep -Seconds 2
Write-Host "`nVerifying POS Services..." -ForegroundColor White
try {
    $apiCheck = Invoke-RestMethod -Uri "http://127.0.0.1:3001" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Host "  ✓ Backend API Health:   ONLINE (http://localhost:3001)" -ForegroundColor Green
} catch {
    Write-Host "  [!] Backend API Health: STARTING / PENDING" -ForegroundColor Yellow
}

try {
    $webCheck = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Host "  ✓ Frontend Web Health:  ONLINE (http://localhost:3000)" -ForegroundColor Green
} catch {
    Write-Host "  [!] Frontend Web Health: STARTING / PENDING" -ForegroundColor Yellow
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "POS Application is ready at: http://localhost:3000" -ForegroundColor Green
Write-Host "API Application is ready at: http://localhost:3001" -ForegroundColor Green
Write-Host "To stop services, run: scripts\stop.bat" -ForegroundColor Gray
Write-Host "======================================================================`n" -ForegroundColor Cyan
