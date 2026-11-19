#!/usr/bin/env bash
set -e

# ==============================================================================
# Let's Buy It - Automated Database & File Restoration Script
# Restores PostgreSQL database and uploaded media from a backup archive.
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Restore script must be run as root (use sudo).${NC}"
  exit 1
fi

TARGET_DIR="${TARGET_DIR:-/var/www/letsbuyit}"
ARCHIVE_FILE="$1"

if [ -z "$ARCHIVE_FILE" ] || [ ! -f "$ARCHIVE_FILE" ]; then
  echo -e "${RED}Usage: sudo bash scripts/restore.sh <path_to_backup.tar.gz>${NC}"
  echo -e "Available backups in $TARGET_DIR/backups/:"
  ls -lh "$TARGET_DIR/backups/"*.tar.gz 2>/dev/null || echo "No backups found."
  exit 1
fi

echo -e "${BOLD}${RED}======================================================================${NC}"
echo -e "${BOLD}${RED}             WARNING: FULL DATABASE & MEDIA RESTORATION               ${NC}"
echo -e "${BOLD}${RED}======================================================================${NC}\n"
echo -e "This operation will overwrite the current PostgreSQL database and uploaded files."
echo -e "Target Archive: ${YELLOW}$ARCHIVE_FILE${NC}\n"

read -p "Are you sure you want to proceed with restoration? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}Restoration cancelled.${NC}"
  exit 0
fi

TEMP_EXTRACT="/tmp/letsbuyit_restore_$(date +%s)"
mkdir -p "$TEMP_EXTRACT"
tar -xzf "$ARCHIVE_FILE" -C "$TEMP_EXTRACT"

BACKUP_SUBDIR=$(find "$TEMP_EXTRACT" -mindepth 1 -maxdepth 1 -type d | head -n 1)

# 1. Stop Services During Restore
echo -e "\n${BOLD}[1/4] Stopping Application Background Services...${NC}"
systemctl stop letsbuyit-web.service || true
systemctl stop letsbuyit-api.service || true

# 2. Restore PostgreSQL Database
echo -e "\n${BOLD}[2/4] Restoring PostgreSQL Database...${NC}"
DB_NAME="letsbuyit_business"
DB_USER="letsbuyit_app"

if [ -f "$BACKUP_SUBDIR/database.sql" ]; then
  # Terminate existing connections to database
  sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
  
  # Drop and recreate database
  sudo -u postgres dropdb "$DB_NAME" || true
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
  
  # Restore data
  sudo -u postgres psql "$DB_NAME" < "$BACKUP_SUBDIR/database.sql" >/dev/null
  echo -e "  ✓ Database restored successfully."
else
  echo -e "${RED}[ERROR] database.sql not found inside backup archive!${NC}"
  rm -rf "$TEMP_EXTRACT"
  exit 1
fi

# 3. Restore Uploaded Media Files
echo -e "\n${BOLD}[3/4] Restoring Uploaded Media Files...${NC}"
if [ -d "$BACKUP_SUBDIR/uploads" ]; then
  mkdir -p "$TARGET_DIR/storage/uploads"
  cp -r "$BACKUP_SUBDIR/uploads/"* "$TARGET_DIR/storage/uploads/"
  echo -e "  ✓ Uploaded media restored."
fi

# 4. Restart Background Services
echo -e "\n${BOLD}[4/4] Restarting Application Services...${NC}"
systemctl restart letsbuyit-api.service
systemctl restart letsbuyit-web.service

sleep 3
API_STATUS=$(systemctl is-active letsbuyit-api.service || echo "failed")
WEB_STATUS=$(systemctl is-active letsbuyit-web.service || echo "failed")

rm -rf "$TEMP_EXTRACT"

echo -e "\n${BOLD}${GREEN}======================================================================${NC}"
echo -e "${BOLD}${GREEN}                   Restoration Completed Successfully!                ${NC}"
echo -e "${BOLD}${GREEN}======================================================================${NC}\n"
echo -e "API Status: ${BOLD}$API_STATUS${NC}"
echo -e "Web Status: ${BOLD}$WEB_STATUS${NC}\n"
EOF

