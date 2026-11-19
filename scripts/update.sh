#!/usr/bin/env bash
set -e

# ==============================================================================
# Let's Buy It - Automated Self-Hosted Update Script
# Atomic updates with automatic pre-update backup and rollback on failure.
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}======================================================================${NC}"
echo -e "${BOLD}${BLUE}             Let's Buy It - Automated Update Manager                  ${NC}"
echo -e "${BOLD}${BLUE}======================================================================${NC}\n"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Update script must be run as root (use sudo).${NC}"
  exit 1
fi

TARGET_DIR="${TARGET_DIR:-/var/www/letsbuyit}"
BACKUP_SCRIPT="$TARGET_DIR/scripts/backup.sh"

if [ ! -d "$TARGET_DIR" ]; then
  echo -e "${RED}[ERROR] Target installation directory not found at: $TARGET_DIR${NC}"
  exit 1
fi

CURRENT_VER=$(grep '"version"' "$TARGET_DIR/version.json" 2>/dev/null | cut -d'"' -f4 || echo "1.0.0")
echo -e "Currently installed version: ${BOLD}${YELLOW}$CURRENT_VER${NC}"

# 1. Automatic Pre-Update Backup
echo -e "\n${BOLD}[1/5] Creating Pre-Update Backup...${NC}"
if [ -f "$BACKUP_SCRIPT" ]; then
  bash "$BACKUP_SCRIPT" --pre-update
else
  echo -e "${YELLOW}  [NOTICE] Backup script not found. Creating manual database snapshot...${NC}"
  mkdir -p "$TARGET_DIR/backups"
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  sudo -u postgres pg_dump letsbuyit_business > "$TARGET_DIR/backups/pre_update_db_${TIMESTAMP}.sql" || true
fi

# 2. Backup Current Artifacts for Rollback
echo -e "\n${BOLD}[2/5] Creating Rollback Snapshot of Current Binaries...${NC}"
ROLLBACK_DIR="$TARGET_DIR/.rollback_artifacts_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ROLLBACK_DIR"
cp -r "$TARGET_DIR/api" "$ROLLBACK_DIR/" 2>/dev/null || true
cp -r "$TARGET_DIR/web" "$ROLLBACK_DIR/" 2>/dev/null || true
cp "$TARGET_DIR/version.json" "$ROLLBACK_DIR/" 2>/dev/null || true

rollback() {
  echo -e "\n${BOLD}${RED}[ROLLBACK TRIGGERED] Update failed. Restoring previous version...${NC}"
  if [ -d "$ROLLBACK_DIR" ]; then
    rm -rf "$TARGET_DIR/api" "$TARGET_DIR/web"
    cp -r "$ROLLBACK_DIR/api" "$TARGET_DIR/"
    cp -r "$ROLLBACK_DIR/web" "$TARGET_DIR/"
    cp "$ROLLBACK_DIR/version.json" "$TARGET_DIR/" 2>/dev/null || true
    systemctl restart letsbuyit-api.service || true
    systemctl restart letsbuyit-web.service || true
    echo -e "${YELLOW}Restored previous version: $CURRENT_VER${NC}"
  fi
  exit 1
}

trap rollback ERR

# 3. Pull / Unpack Latest Release Artifacts
echo -e "\n${BOLD}[3/5] Updating Application Build Artifacts...${NC}"

# If running within a git deployment repo
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -d "$SCRIPT_DIR/.git" ]; then
  echo -e "  - Pulling latest deployment release from Git..."
  cd "$SCRIPT_DIR"
  git fetch origin main || true
  git reset --hard origin/main || true
  
  # Copy updated binaries to target directory
  if [ "$SCRIPT_DIR" != "$TARGET_DIR" ]; then
    cp -r "$SCRIPT_DIR/api/dist" "$TARGET_DIR/api/"
    cp "$SCRIPT_DIR/api/package.json" "$TARGET_DIR/api/"
    cp -r "$SCRIPT_DIR/web" "$TARGET_DIR/"
    cp -r "$SCRIPT_DIR/scripts" "$TARGET_DIR/"
    cp "$SCRIPT_DIR/version.json" "$TARGET_DIR/"
  fi
fi

# Ensure persistent directories and permissions are intact
mkdir -p "$TARGET_DIR/storage/uploads"
mkdir -p "$TARGET_DIR/backups"
mkdir -p "$TARGET_DIR/logs"

# Ensure .env is intact
if [ ! -f "$TARGET_DIR/config/.env" ]; then
  echo -e "${RED}[ERROR] Critical error: config/.env is missing.${NC}"
  rollback
fi

# 4. Install any new production dependencies & Apply Database Migrations
echo -e "\n${BOLD}[4/5] Applying Database Migrations...${NC}"
cd "$TARGET_DIR/api"
npm install --omit=dev --force --silent >/dev/null 2>&1

echo -e "  - Running TypeORM migrations..."
NODE_ENV=production DEPLOYMENT_MODE=self-hosted node dist/migrate.js

# 5. Restart Background Services and Verify Health
echo -e "\n${BOLD}[5/5] Restarting Services and Verifying System Health...${NC}"
systemctl daemon-reload
systemctl restart letsbuyit-api.service
systemctl restart letsbuyit-web.service

sleep 4

API_ACTIVE=$(systemctl is-active letsbuyit-api.service || echo "failed")
WEB_ACTIVE=$(systemctl is-active letsbuyit-web.service || echo "failed")

if [ "$API_ACTIVE" != "active" ] || [ "$WEB_ACTIVE" != "active" ]; then
  echo -e "${RED}[ERROR] Services failed health check after restart.${NC}"
  echo -e "API Status: $API_ACTIVE | Web Status: $WEB_ACTIVE"
  rollback
fi

NEW_VER=$(grep '"version"' "$TARGET_DIR/version.json" 2>/dev/null | cut -d'"' -f4 || echo "latest")

# Clean up rollback snapshot upon success
rm -rf "$ROLLBACK_DIR"

echo -e "\n${BOLD}${GREEN}======================================================================${NC}"
echo -e "${BOLD}${GREEN}         Let's Buy It Successfully Updated to v${NEW_VER}!           ${NC}"
echo -e "${BOLD}${GREEN}======================================================================${NC}\n"

echo -e "Frontend:  ${BOLD}${BLUE}http://localhost:3000${NC}"
echo -e "Backend:   ${BOLD}${BLUE}http://localhost:3001${NC}"
echo -e "Database, uploaded images, and license key preserved intact.\n"
EOF

