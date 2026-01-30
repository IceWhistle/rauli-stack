#!/bin/bash
# Workspace Statistics

echo "=== Asis Workspace Stats ==="
echo ""
echo "📁 Disk Usage:"
du -sh ~/clawd 2>/dev/null | awk '{print "  Workspace: " $1}'
du -sh ~/.clawdbot 2>/dev/null | awk '{print "  Config: " $1}'
echo ""
echo "📝 File Counts:"
echo "  Markdown: $(find ~/clawd -name '*.md' 2>/dev/null | wc -l)"
echo "  Python: $(find ~/clawd -name '*.py' 2>/dev/null | wc -l)"
echo "  JSON: $(find ~/clawd -name '*.json' 2>/dev/null | wc -l)"
echo ""
echo "🧠 Memory Files:"
ls -la ~/clawd/memory/ 2>/dev/null | tail -5
echo ""
echo "⏰ Cron Jobs: $(clawdbot cron list 2>/dev/null | grep -c '"id"')"
echo ""
echo "🔌 Nodes:"
clawdbot nodes status 2>/dev/null | grep -E "Connected|Paired"
