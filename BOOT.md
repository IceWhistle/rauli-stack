# BOOT.md - Gateway Startup Tasks

Run these checks when the gateway starts:

## Quick Health Check
1. Verify disk usage < 80%
2. Check if any cron jobs failed recently
3. Ensure memory files exist

## Auto-Recovery
- If disk > 85%, alert immediately
- If critical files missing, recreate from templates

## Startup Message
Log: "Asis online and ready. Systems nominal."
