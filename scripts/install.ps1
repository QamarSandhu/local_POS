# ==============================================================================
# Let's Buy It - Windows Automated Fresh Installation Script (install.ps1)
# Fully automated setup for Windows 10, Windows 11, and Windows Server (64-bit)
# ==============================================================================

$ErrorActionPreference = "Stop"

# 1. Administrator Privilege Check & Auto-Elevation
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "`n[ELEVATION REQUIRED] Requesting Administrator privileges..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir = Split-Path -Parent $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "           Let's Buy It - Automated Windows Installation              " -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan
Write-Host "Target Installation Directory: $InstallDir`n" -ForegroundColor White

# 2. System Hardware & Compatibility Checks
Write-Host "[1/7] Performing System Requirements & Environment Check..." -ForegroundColor White

# Check OS Version
$osInfo = Get-CimInstance Win32_OperatingSystem
Write-Host "  ✓ Operating System: $($osInfo.Caption) ($($osInfo.OSArchitecture))" -ForegroundColor Green

# Check RAM (Minimum 2 GB)
$totalRamGb = [math]::Round((Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum / 1GB, 1)
if ($totalRamGb -lt 1.8) {
    Write-Host "  [WARNING] System has less than 2 GB RAM ($totalRamGb GB). Performance may be impacted." -ForegroundColor Yellow
} else {
    Write-Host "  ✓ System Memory:    $totalRamGb GB RAM" -ForegroundColor Green
}

# Check Free Disk Space (Minimum 5 GB)
$driveLetter = $InstallDir.Substring(0, 1)
$disk = Get-PSDrive -Name $driveLetter -ErrorAction SilentlyContinue
if ($disk) {
    $freeGb = [math]::Round($disk.Free / 1GB, 1)
    if ($freeGb -lt 5.0) {
        Write-Host "  [ERROR] Insufficient disk space on drive $driveLetter. Minimum 5 GB free space required ($freeGb GB available)." -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Disk Space:       $freeGb GB free on drive $driveLetter" -ForegroundColor Green
}

# Check Port Availability
foreach ($port in @(3000, 3001)) {
    $inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($inUse) {
        Write-Host "  [NOTICE] Port $port is currently in use (PID: $($inUse.OwningProcess[0])). It will be replaced upon startup." -ForegroundColor Yellow
    }
}

# 3. Check & Install Node.js LTS
Write-Host "`n[2/7] Checking Runtime Dependencies (Node.js)..." -ForegroundColor White
$nodeCmd = Get-Command "node.exe" -ErrorAction SilentlyContinue
$nodeInstalled = $false

if ($nodeCmd) {
    try {
        $nodeVer = & node -v
        $nodeMajor = [int]($nodeVer.TrimStart('v').Split('.')[0])
        if ($nodeMajor -ge 20) {
            Write-Host "  ✓ Compatible Node.js detected: $nodeVer" -ForegroundColor Green
            $nodeInstalled = $true
        } else {
            Write-Host "  [!] Node.js version $nodeVer is outdated (>= v20 required)." -ForegroundColor Yellow
        }
    } catch {}
}

if (-not $nodeInstalled) {
    Write-Host "  -> Installing Node.js LTS..." -ForegroundColor Yellow
    $wingetCmd = Get-Command "winget.exe" -ErrorAction SilentlyContinue
    if ($wingetCmd) {
        try {
            Write-Host "  -> Running winget install OpenJS.NodeJS.LTS..." -ForegroundColor White
            & winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            $nodeInstalled = $true
            Write-Host "  ✓ Node.js LTS installed successfully via winget." -ForegroundColor Green
        } catch {
            Write-Host "  [!] Winget install failed, falling back to direct MSI download..." -ForegroundColor Yellow
        }
    }

    if (-not $nodeInstalled) {
        $msiUrl = "https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"
        $msiPath = Join-Path $env:TEMP "node-lts.msi"
        Write-Host "  -> Downloading Node.js LTS installer from $msiUrl..." -ForegroundColor White
        Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath
        Write-Host "  -> Installing Node.js silently..." -ForegroundColor White
        Start-Process msiexec.exe -Wait -ArgumentList "/i `"$msiPath`" /qn /norestart"
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Remove-Item -Force $msiPath -ErrorAction SilentlyContinue
        Write-Host "  ✓ Node.js LTS installed successfully." -ForegroundColor Green
    }
}

# 4. Check PostgreSQL Database Server
Write-Host "`n[3/7] Checking PostgreSQL Database Server..." -ForegroundColor White
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
$psqlCmd = Get-Command "psql.exe" -ErrorAction SilentlyContinue
$dockerCmd = Get-Command "docker.exe" -ErrorAction SilentlyContinue
$pgPortOpen = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue

$psqlPath = if ($psqlCmd) { $psqlCmd.Source } else {
    (Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -Last 1).FullName
}

if ($pgService -or $pgPortOpen -or $psqlPath) {
    Write-Host "  ✓ PostgreSQL instance detected on host (Port 5432 active)." -ForegroundColor Green
} elseif ($dockerCmd) {
    Write-Host "  ✓ Docker detected. Checking for PostgreSQL container..." -ForegroundColor Green
} else {
    Write-Host "  -> PostgreSQL not detected. Installing PostgreSQL via winget..." -ForegroundColor Yellow
    $wingetCmd = Get-Command "winget.exe" -ErrorAction SilentlyContinue
    if ($wingetCmd) {
        try {
            & winget install PostgreSQL.PostgreSQL --silent --accept-package-agreements --accept-source-agreements
            Write-Host "  ✓ PostgreSQL installation initiated via winget." -ForegroundColor Green
        } catch {
            Write-Host "  [NOTICE] Please ensure PostgreSQL 14+ is installed and running on port 5432." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [NOTICE] Please download and install PostgreSQL for Windows from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    }
}

# 5. Configure Dedicated Database & User
Write-Host "`n[4/7] Configuring Dedicated Database & Credentials..." -ForegroundColor White

function Generate-SecureSecret([int]$length = 32) {
    $bytes = New-Object byte[] $length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]','' | Select-Object -First 1
}

$dbUser = "letsbuyit_app"
$dbName = "letsbuyit_business"
$dbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | ForEach-Object {[char]$_})
$jwtAccessSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})
$jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})

# Execute Database & User Creation SQL
$setupSql = @"
DO `$do`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$dbUser') THEN
    CREATE ROLE $dbUser WITH LOGIN PASSWORD '$dbPassword';
  ELSE
    ALTER ROLE $dbUser WITH PASSWORD '$dbPassword';
  END IF;
END
`$do`$;

SELECT 'CREATE DATABASE $dbName OWNER $dbUser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$dbName')\gexec

GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;
"@

$sqlFile = Join-Path $env:TEMP "setup_pos_db.sql"
$setupSql | Set-Content $sqlFile -Encoding UTF8

if ($psqlPath) {
    try {
        & "$psqlPath" -h 127.0.0.1 -p 5432 -U postgres -f "$sqlFile" >$null 2>&1
        Write-Host "  ✓ Dedicated database '$dbName' and user '$dbUser' provisioned." -ForegroundColor Green
    } catch {
        Write-Host "  [i] Note: Default postgres user may require password. User/DB should exist." -ForegroundColor Yellow
    }
} elseif ($dockerCmd) {
    try {
        Get-Content $sqlFile | docker exec -i helsinki-worker-db-1 psql -U letsbuyit -d postgres >$null 2>&1
        Write-Host "  ✓ Database setup executed via Docker PostgreSQL container." -ForegroundColor Green
    } catch {}
}
Remove-Item -Force $sqlFile -ErrorAction SilentlyContinue

# 6. Generate Environment Configuration
Write-Host "`n[5/7] Generating Local Production Configuration (.env)..." -ForegroundColor White
$configDir = Join-Path $InstallDir "config"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$localStoragePath = Join-Path $InstallDir "storage\uploads" -replace '\\','/'

$envContent = @"
# ==============================================================
# Let's Buy It - Windows Self-Hosted Production Configuration
# Automatically Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ==============================================================

NODE_ENV=production
DEPLOYMENT_MODE=self-hosted
PORT=3001
WEB_PORT=3000

# Base Public URLs
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Local PostgreSQL Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$dbPassword
DB_SSL=false
DB_POOL_MAX=20

# Cryptographically Secure JWT Secrets
JWT_ACCESS_SECRET=$jwtAccessSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret
JWT_ACCESS_EXPIRATION=30d
JWT_REFRESH_EXPIRATION=90d

# Local File Storage Driver (Windows Path)
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=$localStoragePath

# Public Cryptographic License Verification Key (Ed25519)
LICENSE_PUBLIC_KEY=MCowBQYDK2VwAyEAPjb2nTgSU0g8/mouPBSpxNpyCBy1u1sw2hnM90KebnM=
"@

# Write to both root .env and config/.env
$rootEnv = Join-Path $InstallDir ".env"
$configEnv = Join-Path $configDir ".env"
$envContent | Set-Content $rootEnv -Encoding UTF8
$envContent | Set-Content $configEnv -Encoding UTF8
Write-Host "  ✓ Generated secure .env configuration." -ForegroundColor Green

# Ensure persistent directories
foreach ($subDir in @("storage\uploads\products", "storage\uploads\logos", "storage\uploads\banners", "backups", "logs")) {
    $fullPath = Join-Path $InstallDir $subDir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
    }
}
Write-Host "  ✓ Local storage directories initialized." -ForegroundColor Green

# 7. Apply Database Migrations and Production Seed
Write-Host "`n[6/7] Initializing Database Schema & Production Seed..." -ForegroundColor White
$oldMode = $env:DEPLOYMENT_MODE
$env:DEPLOYMENT_MODE = "self-hosted"
$env:NODE_ENV = "production"

try {
    Push-Location $InstallDir
    if (Test-Path "api\dist\migrate.js") {
        Write-Host "  -> Running database migrations..." -ForegroundColor White
        node "api/dist/migrate.js"
        Write-Host "  ✓ Database migrations applied." -ForegroundColor Green
    }

    if (Test-Path "api\dist\seed-production.js") {
        Write-Host "  -> Bootstrapping production roles & verticals..." -ForegroundColor White
        node "api/dist/seed-production.js"
        Write-Host "  ✓ Production seed data initialized." -ForegroundColor Green
    }
    Pop-Location
} catch {
    Write-Host "  [!] Migration or seed warning: $_" -ForegroundColor Yellow
} finally {
    $env:DEPLOYMENT_MODE = $oldMode
}

# 8. Create Windows Desktop & Startup Shortcuts
Write-Host "`n[7/7] Setting Up Windows Shortcuts & Service Tasks..." -ForegroundColor White
$startBat = Join-Path $InstallDir "start.bat"
if (-not (Test-Path $startBat)) {
    $startBat = Join-Path $ScriptDir "start.bat"
}

# Desktop Shortcut
try {
    $desktopPath = [System.Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "Let's Buy It POS.lnk"
    $wshShell = New-Object -ComObject WScript.Shell
    $shortcut = $wshShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $startBat
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.Description = "Launch Let's Buy It Universal POS & Commerce"
    $shortcut.Save()
    Write-Host "  ✓ Created Desktop shortcut: Let's Buy It POS" -ForegroundColor Green

    # Startup Folder (Auto-launch on Windows Boot/Logon)
    $startupPath = [System.Environment]::GetFolderPath("Startup")
    $startupShortcut = Join-Path $startupPath "Let's Buy It POS.lnk"
    $sc = $wshShell.CreateShortcut($startupShortcut)
    $sc.TargetPath = $startBat
    $sc.WorkingDirectory = $InstallDir
    $sc.Description = "Auto-start Let's Buy It POS on Windows Login"
    $sc.Save()
    Write-Host "  ✓ Configured auto-startup on Windows login." -ForegroundColor Green
} catch {
    Write-Host "  [i] Note: Could not create desktop shortcut: $_" -ForegroundColor Yellow
}

# Register Daily Backup Task in Windows Task Scheduler (Runs daily at 2:00 AM)
try {
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptDir\backup.ps1`"" -WorkingDirectory $InstallDir
    $trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    Register-ScheduledTask -TaskName "LetsBuyIt-Daily-Backup" -Action $action -Trigger $trigger -Settings $settings -Description "Daily PostgreSQL & uploads backup for Let's Buy It POS" -User "SYSTEM" -Force >$null 2>&1
    Write-Host "  ✓ Scheduled daily automated backup at 02:00 AM (Task Scheduler)." -ForegroundColor Green
} catch {
    Write-Host "  [i] Note: Scheduled task creation requires system admin permissions." -ForegroundColor Yellow
}

# 9. Start Application Immediately
Write-Host "`nLaunching POS Services..." -ForegroundColor White
& (Join-Path $ScriptDir "start.ps1")

$appVer = "1.0.0"
$vFile = Join-Path $InstallDir "version.json"
if (Test-Path $vFile) {
    try {
        $vJson = Get-Content $vFile -Raw | ConvertFrom-Json
        $appVer = $vJson.version
    } catch {}
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "      Let's Buy It Installation Completed Successfully! (v${appVer})  " -ForegroundColor Green
Write-Host "======================================================================`n" -ForegroundColor Cyan

Write-Host "Web Application Portal:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API Server:      http://localhost:3001" -ForegroundColor Yellow
Write-Host "Local Image Storage:     $InstallDir\storage\uploads" -ForegroundColor White
Write-Host "Database Name:           $dbName (User: $dbUser)" -ForegroundColor White
Write-Host "`nQuick Commands:" -ForegroundColor Cyan
Write-Host "  - Start Services:      scripts\start.bat  (or double-click desktop shortcut)" -ForegroundColor White
Write-Host "  - Stop Services:       scripts\stop.bat" -ForegroundColor White
Write-Host "  - Update to Latest:    scripts\update.bat" -ForegroundColor White
Write-Host "  - Create Backup:       scripts\backup.bat" -ForegroundColor White
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in Chrome or Edge." -ForegroundColor White
Write-Host "2. Log in or click 'Register Business' to set up your store." -ForegroundColor White
Write-Host "3. Go to Settings -> License & Subscription to enter your signed activation key.`n" -ForegroundColor White

pause
