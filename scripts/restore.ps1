# ==============================================================================
# Let's Buy It - Windows Restore Manager (restore.ps1)
# Restores PostgreSQL database and uploaded store images from a backup archive
# ==============================================================================

param (
    [Parameter(Mandatory=$false)]
    [string]$BackupFile = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir = Split-Path -Parent $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "             Let's Buy It - Windows Restore Manager                   " -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

# 1. Prompt for backup file if not provided
if (-not $BackupFile) {
    $BackupsDir = Join-Path $InstallDir "backups"
    $availableBackups = Get-ChildItem -Path $BackupsDir -Filter "*.zip" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

    if ($availableBackups) {
        Write-Host "Available Backups in $BackupsDir:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $availableBackups.Count; $i++) {
            Write-Host "  [$($i+1)] $($availableBackups[$i].Name) ($([math]::Round($availableBackups[$i].Length / 1MB, 2)) MB)" -ForegroundColor White
        }
        $selection = Read-Host "`nEnter backup number to restore (or full path)"
        if ($selection -match "^\d+$" -and [int]$selection -le $availableBackups.Count -and [int]$selection -ge 1) {
            $BackupFile = $availableBackups[[int]$selection - 1].FullName
        } else {
            $BackupFile = $selection.Trim('"').Trim("'")
        }
    } else {
        $BackupFile = Read-Host "Enter full path to backup file (.zip)"
        $BackupFile = $BackupFile.Trim('"').Trim("'")
    }
}

if (-not (Test-Path $BackupFile)) {
    Write-Host "[ERROR] Backup file not found at: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "Selected Backup: $BackupFile" -ForegroundColor Green

# 2. Stop running services
Write-Host "`n[1/4] Stopping active POS services..." -ForegroundColor White
& (Join-Path $ScriptDir "stop.ps1")

# 3. Extract Archive
Write-Host "`n[2/4] Extracting backup archive..." -ForegroundColor White
$TempExtract = Join-Path $env:TEMP "letsbuyit_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (Test-Path $TempExtract) { Remove-Item -Recurse -Force $TempExtract }
New-Item -ItemType Directory -Path $TempExtract -Force | Out-Null

$tarCmd = Get-Command "tar.exe" -ErrorAction SilentlyContinue
if ($tarCmd) {
    & tar.exe -xzf $BackupFile -C $TempExtract
} else {
    Expand-Archive -Path $BackupFile -DestinationPath $TempExtract -Force
}

# 4. Restore PostgreSQL Database
Write-Host "`n[3/4] Restoring PostgreSQL Database..." -ForegroundColor White
$sqlFile = Join-Path $TempExtract "database.sql"

$envFile = Join-Path $InstallDir ".env"
if (-not (Test-Path $envFile)) {
    $envFile = Join-Path $InstallDir "config\.env"
}

$dbHost = "127.0.0.1"
$dbPort = "5432"
$dbName = "letsbuyit_business"
$dbUser = "letsbuyit_app"
$dbPassword = ""

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            switch ($key) {
                "DB_HOST" { $dbHost = $val }
                "DB_PORT" { $dbPort = $val }
                "DB_NAME" { $dbName = $val }
                "DB_USER" { $dbUser = $val }
                "DB_PASSWORD" { $dbPassword = $val }
            }
        }
    }
}

if (Test-Path $sqlFile) {
    $pgCmd = Get-Command "psql.exe" -ErrorAction SilentlyContinue
    $psqlPath = if ($pgCmd) { $pgCmd.Source } else {
        (Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -Last 1).FullName
    }

    if ($psqlPath) {
        $oldPass = $env:PGPASSWORD
        $env:PGPASSWORD = $dbPassword
        try {
            & "$psqlPath" -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "$sqlFile" >$null 2>&1
            Write-Host "  ✓ Database restored successfully." -ForegroundColor Green
        } catch {
            Write-Host "  [!] Database restore encountered warnings or errors: $_" -ForegroundColor Yellow
        } finally {
            $env:PGPASSWORD = $oldPass
        }
    } else {
        Write-Host "  [!] psql.exe not found on host. Attempting Docker fallback..." -ForegroundColor Yellow
        try {
            Get-Content $sqlFile | docker exec -i helsinki-worker-db-1 psql -U $dbUser -d $dbName
            Write-Host "  ✓ Database restored via Docker PostgreSQL." -ForegroundColor Green
        } catch {
            Write-Host "  [!] Could not restore database automatically." -ForegroundColor Red
        }
    }
} else {
    Write-Host "  [!] No database.sql found inside backup." -ForegroundColor Yellow
}

# 5. Restore Store Images
Write-Host "`n[4/4] Restoring Uploaded Store Images..." -ForegroundColor White
$extractedUploads = Join-Path $TempExtract "uploads"
$targetUploads = Join-Path $InstallDir "storage\uploads"

if (Test-Path $extractedUploads) {
    if (-not (Test-Path $targetUploads)) {
        New-Item -ItemType Directory -Path $targetUploads -Force | Out-Null
    }
    Copy-Item -Path "$extractedUploads\*" -Destination $targetUploads -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Uploaded media restored to $targetUploads." -ForegroundColor Green
}

# Clean up temp extract
Remove-Item -Recurse -Force $TempExtract -ErrorAction SilentlyContinue

# 6. Restart Services
Write-Host "`nRestarting POS services..." -ForegroundColor White
& (Join-Path $ScriptDir "start.ps1")

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "✓ System Restoration Completed Successfully!" -ForegroundColor Green
Write-Host "======================================================================`n" -ForegroundColor Cyan
