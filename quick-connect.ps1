# Quick Connect Script for Rauli's PC
# Run this when Asis says "PC disconnected"

Write-Host "Connecting to Asis..." -ForegroundColor Cyan

# Clear any corrupted npm cache
npm cache clean --force 2>$null
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx" -ErrorAction SilentlyContinue

# Connect to gateway
npx clawdbot@latest node run --host 100.90.148.32 --port 18789 --display-name "Rauli-PC"
