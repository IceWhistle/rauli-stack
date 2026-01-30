#!/bin/bash
# Quick habit logger for Rauli
# Usage: ./log-habit.sh workout|prayer|supplements|sunlight|sleep

HABIT=$1
DATE=$(date +%Y-%m-%d)
FILE="/home/ubuntu/clawd/tracking/habits.json"

if [ -z "$HABIT" ]; then
    echo "Usage: $0 workout|prayer|supplements|sunlight|sleep"
    exit 1
fi

# Map shorthand to full names
case $HABIT in
    workout|gym|exercise) KEY="workout" ;;
    prayer|pray) KEY="prayer" ;;
    supplements|supps|stack) KEY="supplements" ;;
    sunlight|sun|outside) KEY="morning_sunlight" ;;
    sleep|dsip) KEY="sleep_stack" ;;
    *) echo "Unknown habit: $HABIT"; exit 1 ;;
esac

# Use Python to update JSON
python3 << EOF
import json
from datetime import datetime

with open("$FILE", "r") as f:
    data = json.load(f)

key = "$KEY"
today = "$DATE"
month = today[:7]

habit = data["habits"][key]
habit["last_completed"] = today
habit["total_completions"] += 1

# Update monthly log
if month not in habit["monthly_log"]:
    habit["monthly_log"][month] = []
if today not in habit["monthly_log"][month]:
    habit["monthly_log"][month].append(today)

# Calculate streak
from datetime import datetime, timedelta
dates = sorted(habit["monthly_log"].get(month, []))
if dates:
    streak = 1
    for i in range(len(dates)-1, 0, -1):
        d1 = datetime.strptime(dates[i], "%Y-%m-%d")
        d2 = datetime.strptime(dates[i-1], "%Y-%m-%d")
        if (d1 - d2).days == 1:
            streak += 1
        else:
            break
    habit["streak"] = streak

with open("$FILE", "w") as f:
    json.dump(data, f, indent=2)

print(f"✅ Logged {key} for {today} (streak: {habit['streak']})")
EOF
