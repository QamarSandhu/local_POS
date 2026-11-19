#!/usr/bin/env bash
set -e

# ==============================================================================
# Let's Buy It - Automated Database & File Backup Script
# Creates a unified compressed backup of PostgreSQL database + uploaded media.
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TARGET_DIR="${TARGET_DIR:-/var/www/letsbuyit}"
BACKUP_DIR="$TARGET_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="letsbuyit_backup_${TIMESTAMP}"
TEMP_DIR="/tmp/${BACKUP_NAME}"

mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DIR"

echo -e "${BOLD}${BLUE}======================================================================${NC}"
echo -e "${BOLD}${BLUE}              Let's Buy It - Backup Utility                          ${NC}"
echo -e "${BOLD}${BLUE}======================================================================${NC}\n"

# 1. Database Dump
echo -e "${BOLD}[1/4] Creating PostgreSQL Database Dump...${NC}"
DB_NAME="letsbuyit_business"
if sudo -u postgres pg_dump -F p "$DB_NAME" > "$TEMP_DIR/database.sql" 2>/dev/null; then
  echo -e "  ✓ Database dump created successfully."
else
  echo -e "${RED}[ERROR] Failed to dump database: $DB_NAME${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# 2. Archive Uploaded Images & Media
echo -e "\n${BOLD}[2/4] Archiving Uploaded Business Files & Media...${NC}"
if [ -d "$TARGET_DIR/storage/uploads" ]; then
  cp -r "$TARGET_DIR/storage/uploads" "$TEMP_DIR/uploads"
  echo -e "  ✓ Uploads archived ($(du -sh "$TARGET_DIR/storage/uploads" | awk '{print $1}'))."
else
  mkdir -p "$TEMP_DIR/uploads"
fi

# 3. Copy Version & Config Metadata (Excluding raw secrets)
echo -e "\n${BOLD}[3/4] Packaging Metadata & Configuration Snapshot...${NC}"
if [ -f "$TARGET_DIR/version.json" ]; then
  cp "$TARGET_DIR/version.json" "$TEMP_DIR/"
fi

# Create non-secret environment metadata summary
if [ -f "$TARGET_DIR/config/.env" ]; then
  grep -v 'SECRET' "$TARGET_DIR/config/.env" | grep -v 'PASSWORD' > "$TEMP_DIR/env_summary.txt" || true
fi

# 4. Compress Archive
echo -e "\n${BOLD}[4/4] Creating Compressed Archive...${NC}"
ARCHIVE_PATH="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
tar -czf "$ARCHIVE_PATH" -C "/tmp" "$BACKUP_NAME"
chmod 600 "$ARCHIVE_PATH"
rm -rf "$TEMP_DIR"

# Retention Policy: Keep last 10 backups, clean older ones
cd "$BACKUP_DIR"
BACKUP_COUNT=$(ls -1t letsbuyit_backup_*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
  echo -e "\n  - Applying backup retention policy (keeping 10 most recent)..."
  ls -1t letsbuyit_backup_*.tar.gz | tail -n +11 | xargs -r rm -f
fi

ARCHIVE_SIZE=$(du -sh "$ARCHIVE_PATH" | awk '{print $1}')

echo -e "\n${BOLD}${GREEN}======================================================================${NC}"
echo -e "${BOLD}${GREEN}                   Backup Created Successfully!                       ${NC}"
echo -e "${BOLD}${GREEN}======================================================================${NC}\n"
echo -e "Backup File: ${BOLD}${YELLOW}$ARCHIVE_PATH${NC} ($ARCHIVE_SIZE)"
echo -e "Contents:    PostgreSQL Database SQL Dump + Uploaded Store Images + Metadata\n"

