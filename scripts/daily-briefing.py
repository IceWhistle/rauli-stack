#!/usr/bin/env python3
"""
Daily Briefing Generator for Asis
Generates a comprehensive morning briefing for Rauli
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

def get_calendar_events():
    """Get today's calendar events"""
    try:
        import subprocess
        result = subprocess.run(
            ['python3', '/home/ubuntu/clawd/gcal.py', 'list'],
            capture_output=True, text=True, timeout=30
        )
        return result.stdout if result.returncode == 0 else "Calendar unavailable"
    except:
        return "Calendar check failed"

def get_weather():
    """Get weather (placeholder - can integrate wttr.in)"""
    return "Check weather skill"

def get_pending_tasks():
    """Check for any pending tasks or reminders"""
    tasks = []
    tracking_dir = Path('/home/ubuntu/clawd/tracking')
    if tracking_dir.exists():
        for f in tracking_dir.glob('*.json'):
            try:
                data = json.loads(f.read_text())
                if isinstance(data, dict) and data.get('pending'):
                    tasks.append(f.stem)
            except:
                pass
    return tasks or ["No pending tasks"]

def generate_briefing():
    """Generate the full briefing"""
    now = datetime.now()
    
    briefing = f"""
# Daily Briefing - {now.strftime('%A, %B %d, %Y')}

## 📅 Calendar
{get_calendar_events()}

## ✅ Pending Tasks
{chr(10).join('- ' + t for t in get_pending_tasks())}

## 💊 Today's Stack Reminder
- Morning: Bromantane, Semax, MOTS-C
- Pre-workout: Consider timing with Retatrutide
- Evening: DSIP, Glycine 3g, Mag Glycinate

## 🎯 Focus
What's your #1 priority today?

---
Generated at {now.strftime('%H:%M')} by Asis
"""
    return briefing

if __name__ == '__main__':
    print(generate_briefing())
