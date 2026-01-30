#!/bin/bash
# Security Check Script for Asis
# Run regularly to ensure security posture

echo "=== Asis Security Audit ==="
echo "Date: $(date)"
echo ""

# 1. Check gateway binding
echo "1. Gateway Binding:"
grep -o '"bind":[^,}]*' ~/.clawdbot/clawdbot.json 2>/dev/null || echo "   Not found"

# 2. Check auth mode
echo ""
echo "2. Auth Mode:"
grep -o '"auth".*"mode":[^,}]*' ~/.clawdbot/clawdbot.json 2>/dev/null | head -1 || echo "   Not found"

# 3. Check DM policy
echo ""
echo "3. DM Policy:"
grep -o '"dmPolicy":[^,}]*' ~/.clawdbot/clawdbot.json 2>/dev/null || echo "   Not found"

# 4. Check file permissions
echo ""
echo "4. File Permissions:"
stat -c "%a %n" ~/.clawdbot 2>/dev/null
stat -c "%a %n" ~/.clawdbot/clawdbot.json 2>/dev/null

# 5. Check for exposed ports
echo ""
echo "5. Listening Ports:"
ss -tlnp 2>/dev/null | grep -E "18789|8080|8087" || echo "   No relevant ports exposed externally"

# 6. Check node connections
echo ""
echo "6. Node Connections:"
clawdbot nodes status 2>/dev/null | grep -E "connected|paired" || echo "   No nodes"

# 7. Check for failed login attempts (if logging)
echo ""
echo "7. Recent Security Events:"
grep -i "auth\|denied\|unauthorized" ~/.clawdbot/logs/*.log 2>/dev/null | tail -5 || echo "   No security events found"

# 8. Run official audit
echo ""
echo "8. Official Security Audit:"
clawdbot security audit 2>&1 | tail -10

echo ""
echo "=== Security Check Complete ==="
