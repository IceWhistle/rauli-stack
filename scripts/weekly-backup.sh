#!/bin/bash
# Weekly Clawdbot Backup Script
# Backs up config, keeps last 4 weeks

BACKUP_DIR="/home/ubuntu/clawd/backups"
SOURCE="/home/ubuntu/.clawdbot"
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_DIR"

# Create backup
cp -r "$SOURCE" "$BACKUP_DIR/clawdbot-$DATE"

# Keep only last 4 backups
cd "$BACKUP_DIR"
ls -dt clawdbot-* 2>/dev/null | tail -n +5 | xargs rm -rf 2>/dev/null

echo "Backup complete: clawdbot-$DATE"
du -sh "$BACKUP_DIR/clawdbot-$DATE"
