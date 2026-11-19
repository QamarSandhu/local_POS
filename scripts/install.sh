#!/usr/bin/env bash
set -e

# ==============================================================================
# Let's Buy It - Automated Self-Hosted Production Installation Script
# Supported Platforms: Ubuntu 20.04, 22.04, 24.04 LTS
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}======================================================================${NC}"
echo -e "${BOLD}${BLUE}        Let's Buy It - Self-Hosted Automated Installation             ${NC}"
echo -e "${BOLD}${BLUE}======================================================================${NC}\n"

# 1. Root / Sudo Check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] This installation script must be run as root (use sudo).${NC}"
  exit 1
fi

INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${TARGET_DIR:-/var/www/letsbuyit}"

echo -e "${YELLOW}Source Directory:${NC}  $INSTALL_DIR"
echo -e "${YELLOW}Target Directory:${NC}  $TARGET_DIR\n"

# 2. Environment Detection & Pre-Flight Checks
echo -e "${BOLD}[1/7] Performing Environment Checks...${NC}"

if [ ! -f /etc/os-release ]; then
  echo -e "${RED}[ERROR] Unsupported OS. /etc/os-release not found.${NC}"
  exit 1
fi

. /etc/os-release
if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
  echo -e "${RED}[ERROR] Unsupported operating system: $PRETTY_NAME.${NC}"
  echo -e "${RED}Initially, this automated installer requires Ubuntu 20.04, 22.04, or 24.04 LTS.${NC}"
  exit 1
fi
echo -e "  ✓ Detected Operating System: ${GREEN}$PRETTY_NAME${NC}"

# Memory Check (Minimum 1.5 GB total/available)
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
if [ "$TOTAL_RAM_KB" -lt 1500000 ]; then
  echo -e "${YELLOW}  [WARNING] System has less than 2 GB RAM. It is recommended to configure a swap file.${NC}"
else
  echo -e "  ✓ System Memory: ${GREEN}$((TOTAL_RAM_KB / 1024)) MB RAM${NC}"
fi

# Disk Space Check (Minimum 5 GB free)
FREE_DISK_KB=$(df "$INSTALL_DIR" | tail -1 | awk '{print $4}')
if [ "$FREE_DISK_KB" -lt 5000000 ]; then
  echo -e "${RED}[ERROR] Insufficient disk space. Minimum 5 GB free space required.${NC}"
  exit 1
fi
echo -e "  ✓ Disk Space: ${GREEN}$((FREE_DISK_KB / 1024 / 1024)) GB available${NC}"

# Port Conflict Check
for port in 3000 3001; do
  if ss -tuln | grep -q ":$port "; then
    echo -e "${YELLOW}  [WARNING] Port $port is currently in use. Existing process might be replaced.${NC}"
  fi
done

# 3. Install Runtime Dependencies (Node.js & PostgreSQL)
echo -e "\n${BOLD}[2/7] Checking Runtime Dependencies (Node.js & PostgreSQL)...${NC}"
export DEBIAN_FRONTEND=noninteractive

# Update apt
apt-get update -qq

# Node.js Check / Installation
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VER" -ge 20 ]; then
    echo -e "  ✓ Compatible Node.js detected: ${GREEN}$(node -v)${NC}"
  else
    echo -e "  - Upgrading Node.js to v22 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
    apt-get install -y -qq nodejs
  fi
else
  echo -e "  - Installing Node.js 22 LTS from NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
fi

# PostgreSQL Check / Installation
if command -v psql >/dev/null 2>&1; then
  echo -e "  ✓ PostgreSQL detected: ${GREEN}$(psql --version)${NC}"
else
  echo -e "  - Installing PostgreSQL..."
  apt-get install -y -qq postgresql postgresql-contrib
fi

systemctl enable postgresql >/dev/null 2>&1 || true
systemctl start postgresql >/dev/null 2>&1 || true

# 4. PostgreSQL Database & User Setup
echo -e "\n${BOLD}[3/7] Configuring Dedicated PostgreSQL Database...${NC}"
DB_NAME="letsbuyit_business"
DB_USER="letsbuyit_app"

# Check if database already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" || echo 0)

if [ "$DB_EXISTS" = "1" ]; then
  echo -e "  ✓ Database ${GREEN}$DB_NAME${NC} already exists. Preserving existing database."
  # Reuse existing DB password from .env if present
  if [ -f "$TARGET_DIR/config/.env" ]; then
    DB_PASS=$(grep '^DB_PASSWORD=' "$TARGET_DIR/config/.env" | cut -d'=' -f2-)
  else
    DB_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" >/dev/null 2>&1 || true
  fi
else
  echo -e "  - Creating dedicated non-root user: ${BLUE}$DB_USER${NC}"
  DB_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" >/dev/null 2>&1 || \
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" >/dev/null 2>&1
  
  echo -e "  - Creating isolated database: ${BLUE}$DB_NAME${NC}"
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" >/dev/null 2>&1
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" >/dev/null 2>&1
  echo -e "  ✓ Database setup completed."
fi

# 5. Application Files & Persistent Directory Layout
echo -e "\n${BOLD}[4/7] Setting up Persistent Directories & Files...${NC}"
mkdir -p "$TARGET_DIR/storage/uploads/logos"
mkdir -p "$TARGET_DIR/storage/uploads/covers"
mkdir -p "$TARGET_DIR/storage/uploads/products"
mkdir -p "$TARGET_DIR/storage/uploads/general"
mkdir -p "$TARGET_DIR/backups"
mkdir -p "$TARGET_DIR/logs"
mkdir -p "$TARGET_DIR/config"

# If installing into /var/www/letsbuyit from cloned directory, copy files
if [ "$INSTALL_DIR" != "$TARGET_DIR" ]; then
  echo -e "  - Copying application packages to $TARGET_DIR..."
  cp -r "$INSTALL_DIR/api" "$TARGET_DIR/"
  cp -r "$INSTALL_DIR/web" "$TARGET_DIR/"
  cp -r "$INSTALL_DIR/scripts" "$TARGET_DIR/"
  cp "$INSTALL_DIR/package.json" "$TARGET_DIR/" 2>/dev/null || true
  cp "$INSTALL_DIR/version.json" "$TARGET_DIR/" 2>/dev/null || true
fi

# 6. Generate Environment Configuration (.env)
echo -e "\n${BOLD}[5/7] Generating Secure Environment Configuration...${NC}"
ENV_FILE="$TARGET_DIR/config/.env"

if [ -f "$ENV_FILE" ]; then
  echo -e "  ✓ Existing configuration found at $ENV_FILE. Preserving secrets."
else
  JWT_ACCESS_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
  ADMIN_BOOTSTRAP_SECRET=$(openssl rand -hex 16)

  cat <<EOF > "$ENV_FILE"
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
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_SSL=false
DB_POOL_MAX=20

# JWT Authentication Secrets
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRATION=30d
JWT_REFRESH_EXPIRATION=90d

# Platform Bootstrap Secret
ADMIN_BOOTSTRAP_SECRET=$ADMIN_BOOTSTRAP_SECRET

# Local File Storage Driver (Persists across updates)
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=$TARGET_DIR/storage/uploads

# Cryptographic License Verification (Public key only)
LICENSE_PUBLIC_KEY=MCowBQYDK2VwAyEAPjb2nTgSU0g8/mouPBSpxNpyCBy1u1sw2hnM90KebnM=
EOF

  chmod 600 "$ENV_FILE"
  echo -e "  ✓ Environment file generated with secure random secrets."
fi

# Link .env for applications
ln -sf "$ENV_FILE" "$TARGET_DIR/api/.env" 2>/dev/null || true
ln -sf "$ENV_FILE" "$TARGET_DIR/web/.env" 2>/dev/null || true
ln -sf "$ENV_FILE" "$TARGET_DIR/web/apps/web/.env" 2>/dev/null || true

# 7. Install Production Dependencies & Database Migrations
echo -e "\n${BOLD}[6/7] Installing Production Dependencies & Initializing Schema...${NC}"
cd "$TARGET_DIR/api"
echo -e "  - Installing API production runtime packages..."
npm install --omit=dev --force --silent >/dev/null 2>&1

echo -e "  - Applying TypeORM database migrations..."
NODE_ENV=production DEPLOYMENT_MODE=self-hosted node dist/migrate.js

echo -e "  - Running production bootstrap seeder..."
NODE_ENV=production DEPLOYMENT_MODE=self-hosted node dist/seed-production.js

# 8. Setup Systemd Services
echo -e "\n${BOLD}[7/7] Configuring Systemd Background Services...${NC}"

# Service 1: API Service
cat <<EOF > /etc/systemd/system/letsbuyit-api.service
[Unit]
Description=Let's Buy It NestJS Backend API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=$TARGET_DIR/api
EnvironmentFile=$TARGET_DIR/config/.env
ExecStart=/usr/bin/node dist/src/main.js
Restart=always
RestartSec=5
StandardOutput=append:$TARGET_DIR/logs/api.log
StandardError=append:$TARGET_DIR/logs/api-error.log

[Install]
WantedBy=multi-user.target
EOF

# Service 2: Web Frontend Service
WEB_SERVER_SCRIPT="$TARGET_DIR/web/apps/web/server.js"
if [ ! -f "$WEB_SERVER_SCRIPT" ]; then
  WEB_SERVER_SCRIPT="$TARGET_DIR/web/server.js"
fi

cat <<EOF > /etc/systemd/system/letsbuyit-web.service
[Unit]
Description=Let's Buy It Next.js Frontend
After=network.target letsbuyit-api.service
Wants=letsbuyit-api.service

[Service]
Type=simple
User=root
WorkingDirectory=$TARGET_DIR/web
EnvironmentFile=$TARGET_DIR/config/.env
Environment=PORT=3000
Environment=NODE_ENV=production
ExecStart=/usr/bin/node $WEB_SERVER_SCRIPT
Restart=always
RestartSec=5
StandardOutput=append:$TARGET_DIR/logs/web.log
StandardError=append:$TARGET_DIR/logs/web-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable letsbuyit-api.service >/dev/null 2>&1
systemctl restart letsbuyit-api.service
systemctl enable letsbuyit-web.service >/dev/null 2>&1
systemctl restart letsbuyit-web.service

# Verify service health
sleep 3
API_STATUS=$(systemctl is-active letsbuyit-api.service || echo "failed")
WEB_STATUS=$(systemctl is-active letsbuyit-web.service || echo "failed")

APP_VERSION=$(grep '"version"' "$TARGET_DIR/version.json" 2>/dev/null | cut -d'"' -f4 || echo "1.0.0")

echo -e "\n${BOLD}${GREEN}======================================================================${NC}"
echo -e "${BOLD}${GREEN}        Let's Buy It Installation Completed Successfully!             ${NC}"
echo -e "${BOLD}${GREEN}======================================================================${NC}\n"

echo -e "Frontend Web Portal:  ${BOLD}${BLUE}http://localhost:3000${NC}"
echo -e "Backend API Server:   ${BOLD}${BLUE}http://localhost:3001${NC}\n"

echo -e "Application Version:  ${BOLD}${GREEN}$APP_VERSION${NC}"
echo -e "Database:             ${BOLD}$DB_NAME${NC} (User: $DB_USER)"
echo -e "Storage Mode:         ${BOLD}Local Storage${NC} ($TARGET_DIR/storage/uploads)"
echo -e "API Service Status:   ${BOLD}$API_STATUS${NC}"
echo -e "Web Service Status:   ${BOLD}$WEB_STATUS${NC}\n"

echo -e "${BOLD}${YELLOW}Next Steps:${NC}"
echo -e "1. Open ${BLUE}http://localhost:3000${NC} in your browser to log in or register your store."
echo -e "2. Navigate to ${BLUE}Settings -> License & Subscription${NC} to enter your digitally signed license key."
echo -e "3. To check service logs at any time: ${YELLOW}journalctl -u letsbuyit-api -f${NC}\n"

