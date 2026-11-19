# ==============================================================================
# Let's Buy It - POS System Status (status.ps1)
# Inspects running processes, ports, memory usage, and health
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "             Let's Buy It - POS System Status (Windows)               " -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

# 1. API Status (Port 3001)
$apiConn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($apiConn) {
    $proc = Get-Process -Id $apiConn.OwningProcess[0] -ErrorAction SilentlyContinue
    $memMb = [math]::Round($proc.WorkingSet64 / 1MB, 1)
    Write-Host "  ● Backend API (Port 3001):   RUNNING" -ForegroundColor Green
    Write-Host "    - PID:            $($proc.Id)" -ForegroundColor Gray
    Write-Host "    - Memory:         $memMb MB" -ForegroundColor Gray
    Write-Host "    - Process:        $($proc.ProcessName)" -ForegroundColor Gray
    try {
        $apiPing = Invoke-RestMethod -Uri "http://127.0.0.1:3001" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "    - Health Check:   ONLINE ($apiPing)" -ForegroundColor Green
    } catch {
        Write-Host "    - Health Check:   WARNING ($($_.Exception.Message))" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ○ Backend API (Port 3001):   STOPPED" -ForegroundColor Red
}

Write-Host ""

# 2. Web Status (Port 3000)
$webConn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($webConn) {
    $proc = Get-Process -Id $webConn.OwningProcess[0] -ErrorAction SilentlyContinue
    $memMb = [math]::Round($proc.WorkingSet64 / 1MB, 1)
    Write-Host "  ● Frontend Web (Port 3000):  RUNNING" -ForegroundColor Green
    Write-Host "    - PID:            $($proc.Id)" -ForegroundColor Gray
    Write-Host "    - Memory:         $memMb MB" -ForegroundColor Gray
    Write-Host "    - Process:        $($proc.ProcessName)" -ForegroundColor Gray
    try {
        $webPing = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "    - Health Check:   ONLINE (HTTP $($webPing.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "    - Health Check:   WARNING ($($_.Exception.Message))" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ○ Frontend Web (Port 3000):  STOPPED" -ForegroundColor Red
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "Web Portal:  http://localhost:3000" -ForegroundColor White
Write-Host "API Portal:  http://localhost:3001" -ForegroundColor White
Write-Host "======================================================================`n" -ForegroundColor Cyan
