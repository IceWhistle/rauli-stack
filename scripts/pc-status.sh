#!/bin/bash
# Get Rauli-PC status via node command

echo "=== Rauli-PC Remote Status ==="
clawdbot nodes status 2>/dev/null | grep -A5 "Rauli-PC"

if clawdbot nodes status 2>/dev/null | grep -q "connected.*true"; then
    echo ""
    echo "Running health check..."
    clawdbot nodes run --node Rauli-PC --command 'powershell' --args '-Command' 'Get-WmiObject Win32_Processor | Select LoadPercentage' 2>/dev/null
else
    echo ""
    echo "PC is disconnected. Tell Rauli to run Connect-Asis.bat"
fi
