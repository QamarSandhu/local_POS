# Let's Buy It — Self-Hosted Production Deployment Package (Windows & Linux)

This repository contains deployment-ready application artifacts and automated management scripts for **Let's Buy It Universal POS & Commerce**.

## Quick Installation on Windows (Recommended)

1. **Clone or Download Repository**:
```cmd
git clone https://github.com/QamarSandhu/local_POS.git
cd local_POS
```

2. **Run Installer**:
Right-click `install.bat` and select **Run as Administrator** (or execute from PowerShell / CMD as Administrator):
```cmd
install.bat
```
*(Or: `powershell -ExecutionPolicy Bypass -File scripts\install.ps1`)*

### What the Installer Automates on Windows:
- Checks hardware prerequisites, RAM, disk space, and open ports.
- Detects or installs compatible Node.js LTS and PostgreSQL (if missing).
- Configures dedicated `letsbuyit_business` database and `letsbuyit_app` user with strong credentials.
- Generates production `.env` with 64-character randomized JWT secrets.
- Runs all TypeORM database migrations and initial production seeders.
- Creates Desktop and Startup folder shortcuts (`Let's Buy It POS.lnk`) so POS starts automatically with Windows.
- Starts POS services immediately at `http://localhost:3000` (Web) and `http://localhost:3001` (API).

## Management Commands on Windows

| Action | How to Run |
| :--- | :--- |
| **Start POS Services** | Double-click `start.bat` or run `scripts\start.bat` |
| **Stop POS Services** | Double-click `stop.bat` or run `scripts\stop.bat` |
| **Check System Status** | Double-click `status.bat` or run `scripts\status.bat` |
| **Update to Latest Version** | Right-click `update.bat` ➔ **Run as Administrator** |
| **Create Local Backup** | Double-click `backup.bat` or run `scripts\backup.bat` |
| **Restore a Backup** | Run `scripts\restore.bat` |

---

## Linux (Ubuntu LTS) Installation

```bash
git clone https://github.com/QamarSandhu/local_POS.git
cd local_POS
sudo bash scripts/install.sh
```
