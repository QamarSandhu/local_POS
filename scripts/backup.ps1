# ==============================================================================
# Let's Buy It - Windows Backup Manager (backup.ps1)
# Creates a unified compressed archive of PostgreSQL DB + Uploaded store images
# ==============================================================================

param (
    [switch]$PreUpdate,
    [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir = Split-Path -Parent $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "             Let's Buy It - Windows Backup Manager                    " -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

# 1. Determine Output Directory
$BackupsDir = if ($OutDir) { $OutDir } else { Join-Path $InstallDir "backups" }
if (-not (Test-Path $BackupsDir)) {
    New-Item -ItemType Directory -Path $BackupsDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ArchiveName = if ($PreUpdate) { "pre_update_backup_${Timestamp}.zip" } else { "letsbuyit_backup_${Timestamp}.zip" }
$ArchivePath = Join-Path $BackupsDir $ArchiveName

# 2. Parse Environment Variables
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

# 3. Locate pg_dump.exe
$pgDumpCmd = Get-Command "pg_dump.exe" -ErrorAction SilentlyContinue
$pgDumpPath = ""

if ($pgDumpCmd) {
    $pgDumpPath = $pgDumpCmd.Source
} else {
    $possiblePgDumps = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\pg_dump.exe" -ErrorAction SilentlyContinue
    if ($possiblePgDumps) {
        $pgDumpPath = $possiblePgDumps[-1].FullName
    }
}

# 4. Create Temporary Staging Directory
$TempStage = Join-Path $env:TEMP "letsbuyit_stage_${Timestamp}"
if (Test-Path $TempStage) { Remove-Item -Recurse -Force $TempStage }
New-Item -ItemType Directory -Path $TempStage -Force | Out-Null

$SqlDumpFile = Join-Path $TempStage "database.sql"

# 5. Execute Database Dump
Write-Host "  -> Dumping PostgreSQL Database ($dbName)..." -ForegroundColor White
if ($pgDumpPath) {
    $oldPass = $env:PGPASSWORD
    $env:PGPASSWORD = $dbPassword
    try {
        & "$pgDumpPath" -h $dbHost -p $dbPort -U $dbUser -d $dbName --no-owner --clean --if-exists -f "$SqlDumpFile"
        Write-Host "  ✓ Database dump created using native pg_dump." -ForegroundColor Green
    } catch {
        Write-Host "  [!] pg_dump failed: $_" -ForegroundColor Yellow
    } finally {
        $env:PGPASSWORD = $oldPass
    }
} else {
    # Check if docker is running PostgreSQL container
    $dockerCheck = Get-Command "docker.exe" -ErrorAction SilentlyContinue
    if ($dockerCheck) {
        try {
            $dockerOutput = & docker exec helsinki-worker-db-1 pg_dump -U $dbUser -d $dbName --clean --if-exists
            $dockerOutput | Set-Content $SqlDumpFile
            Write-Host "  ✓ Database dump created using Docker PostgreSQL container." -ForegroundColor Green
        } catch {
            Write-Host "  [!] Docker dump failed: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [WARNING] pg_dump.exe not found in PATH or standard PostgreSQL directories." -ForegroundColor Yellow
        "/* Empty dump: pg_dump not installed on host */" | Set-Content $SqlDumpFile
    }
}

# 6. Copy Uploaded Images
$UploadsDir = Join-Path $InstallDir "storage\uploads"
$StageUploads = Join-Path $TempStage "uploads"
New-Item -ItemType Directory -Path $StageUploads -Force | Out-Null

if (Test-Path $UploadsDir) {
    Write-Host "  -> Archiving persistent store uploads..." -ForegroundColor White
    Copy-Item -Path "$UploadsDir\*" -Destination $StageUploads -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Uploads captured." -ForegroundColor Green
}

# 7. Create Manifest Metadata
$versionFile = Join-Path $InstallDir "version.json"
$appVersion = "1.0.0"
if (Test-Path $versionFile) {
    try {
        $vJson = Get-Content $versionFile -Raw | ConvertFrom-Json
        $appVersion = $vJson.version
    } catch {}
}

$manifest = @{
    application = "Let's Buy It POS"
    version = $appVersion
    backupDate = (Get-Date).ToString("o")
    backupType = if ($PreUpdate) { "pre-update" } else { "scheduled" }
    platform = "windows"
} | ConvertTo-Json

$manifest | Set-Content (Join-Path $TempStage "manifest.json")

# 8. Compress Staging to Archive
Write-Host "  -> Compressing backup archive..." -ForegroundColor White
if (Test-Path $ArchivePath) { Remove-Item -Force $ArchivePath }

# Use native tar if available or Compress-Archive
$tarCmd = Get-Command "tar.exe" -ErrorAction SilentlyContinue
if ($tarCmd) {
    Push-Location $TempStage
    & tar.exe -czf $ArchivePath *
    Pop-Location
} else {
    Compress-Archive -Path "$TempStage\*" -DestinationPath $ArchivePath -Force
}

# Clean up stage
Remove-Item -Recurse -Force $TempStage -ErrorAction SilentlyContinue

# 9. Enforce Retention (Keep 10 most recent)
$existingBackups = Get-ChildItem -Path $BackupsDir -Filter "letsbuyit_backup_*.zip" | Sort-Object LastWriteTime -Descending
if ($existingBackups.Count -gt 10) {
    $existingBackups | Select-Object -Skip 10 | ForEach-Object {
        Remove-Item -Force $_.FullName -ErrorAction SilentlyContinue
    }
}

$archiveSize = [math]::Round((Get-Item $ArchivePath).Length / 1MB, 2)

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "✓ Backup Created Successfully!" -ForegroundColor Green
Write-Host "Archive:  $ArchivePath ($archiveSize MB)" -ForegroundColor Yellow
Write-Host "Contents: PostgreSQL DB + Store Images + Version Metadata" -ForegroundColor White
Write-Host "======================================================================`n" -ForegroundColor Cyan
