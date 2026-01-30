#!/usr/bin/env python3
"""
Habit Tracker - Track streaks and generate progress reports
"""

import json
from datetime import datetime, timedelta
from pathlib import Path

WORKSPACE = Path("/home/ubuntu/clawd")
HABITS_FILE = WORKSPACE / "tracking" / "habits.json"

def load_habits():
    """Load habits from JSON"""
    if not HABITS_FILE.exists():
        return {"habits": {}}
    with open(HABITS_FILE) as f:
        return json.load(f)

def save_habits(data):
    """Save habits to JSON"""
    with open(HABITS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def log_habit(habit_name, completed=True):
    """Log a habit completion"""
    data = load_habits()
    
    if habit_name not in data["habits"]:
        print(f"Habit '{habit_name}' not found")
        return False
    
    habit = data["habits"][habit_name]
    today = datetime.now().strftime("%Y-%m-%d")
    current_month = datetime.now().strftime("%Y-%m")
    
    if completed:
        # Update streak
        last_completed = habit.get("last_completed")
        if last_completed:
            last_date = datetime.strptime(last_completed, "%Y-%m-%d")
            if (datetime.now() - last_date).days == 1:
                habit["streak"] += 1
            else:
                habit["streak"] = 1
        else:
            habit["streak"] = 1
        
        habit["last_completed"] = today
        habit["total_completions"] += 1
        
        # Monthly log
        if current_month not in habit["monthly_log"]:
            habit["monthly_log"][current_month] = []
        habit["monthly_log"][current_month].append(today)
    
    save_habits(data)
    return True

def get_progress_summary():
    """Get summary of all habit streaks"""
    data = load_habits()
    summary = []
    
    for habit_name, habit in data["habits"].items():
        streak = habit.get("streak", 0)
        total = habit.get("total_completions", 0)
        last = habit.get("last_completed", "Never")
        
        # Calculate this month's completion rate
        current_month = datetime.now().strftime("%Y-%m")
        month_completions = len(habit.get("monthly_log", {}).get(current_month, []))
        days_in_month = datetime.now().day
        month_rate = round((month_completions / days_in_month) * 100) if days_in_month > 0 else 0
        
        summary.append({
            "habit": habit["name"],
            "streak": f"{streak} days",
            "this_month": f"{month_completions}/{days_in_month} days ({month_rate}%)",
            "total": total,
            "last": last
        })
    
    return summary

def generate_monthly_report():
    """Generate monthly habit report"""
    data = load_habits()
    current_month = datetime.now().strftime("%Y-%m")
    days_in_month = datetime.now().day
    
    report = f"""# Habit Tracker Report - {datetime.now().strftime('%B %Y')}

## Progress Summary

"""
    
    for habit_name, habit in data["habits"].items():
        month_completions = len(habit.get("monthly_log", {}).get(current_month, []))
        rate = round((month_completions / days_in_month) * 100) if days_in_month > 0 else 0
        streak = habit.get("streak", 0)
        
        # Visual progress bar
        filled = int(rate / 10)
        bar = "█" * filled + "░" * (10 - filled)
        
        report += f"""### {habit['name']}
- **Streak:** {streak} days 🔥
- **This Month:** {month_completions}/{days_in_month} days ({rate}%)
- Progress: [{bar}] {rate}%

"""
    
    return report

if __name__ == "__main__":
    # Example usage
    summary = get_progress_summary()
    for item in summary:
        print(f"{item['habit']}: {item['streak']} streak, {item['this_month']}")
