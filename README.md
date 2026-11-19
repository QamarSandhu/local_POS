# Let's Buy It — Self-Hosted Production Deployment Package

This repository contains deployment-ready application artifacts and automated management scripts for **Let's Buy It**.

## Quick Installation (Ubuntu LTS)

To install on a fresh business server running Ubuntu 20.04, 22.04, or 24.04 LTS:

```bash
git clone https://github.com/QamarSandhu/local_POS.git
cd local_POS
sudo bash scripts/install.sh
```

## System Requirements
- **OS**: Ubuntu 20.04 / 22.04 / 24.04 LTS (x86_64 or arm64)
- **RAM**: Minimum 2 GB (4 GB recommended)
- **Disk**: 10 GB free space
- **Ports**: 3000 (Web Frontend), 3001 (API Backend), 5432 (Local PostgreSQL)

## Management Commands

### Updating
```bash
sudo bash scripts/update.sh
```

### Backups
```bash
sudo bash scripts/backup.sh
```

### Restoring
```bash
sudo bash scripts/restore.sh /path/to/backup.tar.gz
```
