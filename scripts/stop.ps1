# ==============================================================================
# Let's Buy It - Windows Service Stopper (stop.ps1)
# Stops running backend API and frontend Web processes
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          Let's Buy It - Stopping POS Services (Windows)              " -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

$stoppedCount = 0

foreach ($port in @(3001, 3000)) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            try {
                $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "  -> Stopping process on port $port (PID: $procId - $($proc.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                    $stoppedCount++
                    Write-Host "  ✓ Process $procId terminated." -ForegroundColor Green
                }
            } catch {
                Write-Host "  [!] Could not terminate PID $procId: $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  [i] Port $port is already free." -ForegroundColor Gray
    }
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
if ($stoppedCount -gt 0) {
    Write-Host "✓ All Let's Buy It POS services stopped successfully." -ForegroundColor Green
} else {
    Write-Host "All Let's Buy It services were already stopped." -ForegroundColor Yellow
}
Write-Host "======================================================================`n" -ForegroundColor Cyan
