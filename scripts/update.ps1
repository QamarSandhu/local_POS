# ==============================================================================
# Let's Buy It - Automated Windows Update Script (update.ps1)
# Atomic updates with automatic pre-update backup and rollback on failure.
# ==============================================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir = Split-Path -Parent $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          Let's Buy It - Automated Update Manager (Windows)           " -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

$versionFile = Join-Path $InstallDir "version.json"
$currentVer = "1.0.0"
if (Test-Path $versionFile) {
    try {
        $vJson = Get-Content $versionFile -Raw | ConvertFrom-Json
        $currentVer = $vJson.version
    } catch {}
}
Write-Host "Currently Installed Version: $currentVer" -ForegroundColor Yellow

# 1. Automatic Pre-Update Backup
Write-Host "`n[1/5] Creating Pre-Update Backup..." -ForegroundColor White
$backupScript = Join-Path $ScriptDir "backup.ps1"
if (Test-Path $backupScript) {
    & $backupScript -PreUpdate
} else {
    Write-Host "  [i] Backup script not found. Proceeding with caution." -ForegroundColor Yellow
}

# 2. Create Rollback Snapshot of Current Binaries
Write-Host "`n[2/5] Creating Rollback Snapshot of Current Binaries..." -ForegroundColor White
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$rollbackDir = Join-Path $InstallDir ".rollback_artifacts_${timestamp}"
New-Item -ItemType Directory -Path $rollbackDir -Force | Out-Null

Copy-Item -Path (Join-Path $InstallDir "api") -Destination $rollbackDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path (Join-Path $InstallDir "web") -Destination $rollbackDir -Recurse -Force -ErrorAction SilentlyContinue
if (Test-Path $versionFile) {
    Copy-Item -Path $versionFile -Destination $rollbackDir -Force -ErrorAction SilentlyContinue
}

function Invoke-Rollback {
    Write-Host "`n[ROLLBACK TRIGGERED] Update failed. Restoring previous version..." -ForegroundColor Red
    if (Test-Path $rollbackDir) {
        Remove-Item -Recurse -Force (Join-Path $InstallDir "api") -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force (Join-Path $InstallDir "web") -ErrorAction SilentlyContinue
        Copy-Item -Path (Join-Path $rollbackDir "api") -Destination $InstallDir -Recurse -Force
        Copy-Item -Path (Join-Path $rollbackDir "web") -Destination $InstallDir -Recurse -Force
        if (Test-Path (Join-Path $rollbackDir "version.json")) {
            Copy-Item -Path (Join-Path $rollbackDir "version.json") -Destination $InstallDir -Force
        }
        & (Join-Path $ScriptDir "stop.ps1")
        & (Join-Path $ScriptDir "start.ps1")
        Write-Host "Restored previous working version: $currentVer" -ForegroundColor Yellow
    }
    exit 1
}

try {
    # 3. Pull Latest Release Artifacts
    Write-Host "`n[3/5] Updating Application Build Artifacts..." -ForegroundColor White
    $gitDir = Join-Path $InstallDir ".git"
    if (Test-Path $gitDir) {
        Write-Host "  -> Fetching latest release from Git..." -ForegroundColor White
        Push-Location $InstallDir
        git fetch origin main --tags
        git reset --hard origin/main
        Pop-Location
        Write-Host "  ✓ Latest artifacts pulled." -ForegroundColor Green
    } else {
        Write-Host "  [i] Not a Git clone. Assuming updated artifacts exist in directory." -ForegroundColor Yellow
    }

    # Ensure persistent directories exist
    foreach ($sub in @("storage\uploads\products", "storage\uploads\logos", "storage\uploads\banners", "backups", "logs")) {
        $p = Join-Path $InstallDir $sub
        if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
    }

    # 4. Apply Database Migrations
    Write-Host "`n[4/5] Applying Database Migrations..." -ForegroundColor White
    $migrateJs = Join-Path $InstallDir "api\dist\migrate.js"
    if (Test-Path $migrateJs) {
        $oldMode = $env:DEPLOYMENT_MODE
        $env:DEPLOYMENT_MODE = "self-hosted"
        $env:NODE_ENV = "production"
        try {
            Push-Location $InstallDir
            node "api/dist/migrate.js"
            Pop-Location
            Write-Host "  ✓ Database migrations executed." -ForegroundColor Green
        } finally {
            $env:DEPLOYMENT_MODE = $oldMode
        }
    } else {
        Write-Host "  [i] No migrate.js found. Skipping database migration." -ForegroundColor Yellow
    }

    # 5. Restart Background Services and Verify Health
    Write-Host "`n[5/5] Restarting Services and Verifying System Health..." -ForegroundColor White
    & (Join-Path $ScriptDir "stop.ps1")
    Start-Sleep -Seconds 1
    & (Join-Path $ScriptDir "start.ps1")

    Start-Sleep -Seconds 3

    $apiRunning = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
    $webRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

    if (-not $apiRunning -or -not $webRunning) {
        throw "One or more services failed to start (API: $([bool]$apiRunning), Web: $([bool]$webRunning))."
    }

    $newVer = "latest"
    if (Test-Path $versionFile) {
        try {
            $vJson = Get-Content $versionFile -Raw | ConvertFrom-Json
            $newVer = $vJson.version
        } catch {}
    }

    # Clean up rollback directory on success
    Remove-Item -Recurse -Force $rollbackDir -ErrorAction SilentlyContinue

    Write-Host "`n======================================================================" -ForegroundColor Cyan
    Write-Host "✓ Let's Buy It Successfully Updated to v${newVer}!" -ForegroundColor Green
    Write-Host "======================================================================`n" -ForegroundColor Cyan
    Write-Host "Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "Backend:   http://localhost:3001" -ForegroundColor White
    Write-Host "Database, uploaded store images, and license key preserved intact.`n" -ForegroundColor Green

} catch {
    Write-Host "`n[ERROR] Update failed: $_" -ForegroundColor Red
    Invoke-Rollback
}
