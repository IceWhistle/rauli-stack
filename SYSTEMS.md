# ASIS SYSTEMS - Complete Guide

**Last updated:** 2026-01-26

This document explains all the automated systems I've built for you.

---

## 🎯 DAILY INTENT TRACKING

**What it does:**
- Morning (7:30 AM): Asks "What's your #1 priority today?"
- Evening (8:00 PM): Reviews "Did you accomplish it?"
- Tracks completion rates over time

**How to use:**
- Just answer when I ask
- I'll log everything automatically
- You'll get monthly stats on your completion rate

**Files:**
- `/home/ubuntu/clawd/tracking/daily-intent.json` - All your daily priorities
- View anytime: Just ask "Show me my daily intent stats"

---

## 🔥 HABIT STREAK TRACKER

**Tracking:**
- Workouts
- Prayer (Lord's Prayer)
- Supplement stack compliance
- Morning sunlight exposure
- Evening sleep stack (DSIP, etc.)

**How to log:**
- Message me: "Logged workout" or "Did my prayer today"
- I'll update your streaks automatically
- Monthly reports on the 1st of each month

**Commands:**
- "Show my habit streaks"
- "Habit progress"
- "Log [habit name]"

**Files:**
- `/home/ubuntu/clawd/tracking/habits.json` - Your streak data
- `/home/ubuntu/clawd/habit-tracker.py` - The tracker script

---

## 📧 EMAIL INTELLIGENCE

**What it does:**
- Smart categorization (urgent, needs response, financial, personal)
- Identifies emails needing replies
- Tracks financial transactions for spending reports
- Better than basic digest - I'll tell you what actually matters

**Enhanced from basic digest:**
- Morning (8 AM): Daily email digest (already running)
- Now with: urgency levels, response tracking, draft replies available

**How to use:**
- I'll alert you to urgent emails
- Ask: "Draft a reply to [sender]" - I'll write it for you
- Monthly: I'll summarize spending from email receipts

**Files:**
- `/home/ubuntu/clawd/email-intelligence.py` - Smart email analyzer
- `/home/ubuntu/clawd/tracking/email-state.json` - Tracking state

---

## 💰 FINANCIAL TRACKING

**Auto-tracked categories:**
- Supplements & Nootropics
- Food & Dining
- Gaming & Entertainment
- Subscriptions & Services
- School & Education
- Health & Medical

**What you get:**
- Monthly spending breakdown (1st of each month, 6 PM)
- Category totals: "You spent $X on supplements this month"
- Trend analysis
- Budget optimization suggestions

**How it works:**
- I scan your email receipts automatically
- Categorize transactions
- Build spending reports
- No manual entry needed

**Files:**
- `/home/ubuntu/clawd/tracking/finances.json` - Your financial data
- Monthly reports saved in `/home/ubuntu/clawd/reports/finances/`

---

## 👨‍👩‍👧‍👦 FAMILY CONNECTION REMINDERS

**Tracking:**
- Girlfriend (daily expected)
- Mom & Dad (every 3 days)
- Grandma & Grandpa (weekly)

**What I'll do:**
- Sunday 5 PM: Gentle reminder if you haven't connected
- Track birthdays (once you tell me dates)
- Gift idea suggestions when holidays approach

**How to update:**
- Message: "Called grandma today"
- "Mom's birthday is March 15"
- I'll log it automatically

**Files:**
- `/home/ubuntu/clawd/tracking/family-connections.json` - Connection tracking

---

## 🧬 BIOHACKING RESEARCH AGENT

**What I'll research:**
- Emerging peptides before they're mainstream
- New nootropic compounds
- Longevity research updates
- Supplier new releases (Nootropics Depot, etc.)
- Reddit trends (r/Nootropics, r/Peptides, r/Biohacking)

**When:**
- Weekly deep-dive (Mondays, 9 AM)
- Ad-hoc when you ask

**Deliverables:**
- Tier lists (S-tier to F-tier compounds)
- Safety profiles
- Where to buy
- Community consensus
- Scientific backing

**Files:**
- `/home/ubuntu/clawd/research/biohacking/` - All research reports
- Weekly reports: `YYYY-MM-DD-research.md`

---

## 📰 NEWS & CONTENT CURATION

**Your curated topics:**
- Biohacking & optimization
- Deadlock / gaming news
- Faith & Christian content
- Health & fitness science
- Tech & productivity tools

**What I filter out:**
- Politics
- Drama
- Clickbait
- Noise

**What you get:**
- Only high-signal content
- Relevant to YOUR interests
- Concise summaries
- Actionable insights

**When:**
- Can be set up daily if you want
- Currently: on-demand ("What's new in [topic]?")

**Files:**
- `/home/ubuntu/clawd/news/` - Daily briefs

---

## 🎓 CANVAS LMS HELPER

**What it will do (needs setup):**
- Auto-check for new assignments
- Deadline reminders (2 days before)
- Help structure study plans
- Summarize readings you paste

**Setup needed:**
- Your Canvas API token
- Once you provide it, I'll activate full automation

**How to get API token:**
1. Log into Canvas
2. Account → Settings → New Access Token
3. Send it to me securely

**Files:**
- `/home/ubuntu/clawd/canvas-checker.py` - Assignment checker
- `/home/ubuntu/clawd/tracking/canvas-state.json` - Course tracking

---

## 🔒 SECURITY MONITORING

**Already active:**
- Real-time brute force detection
- Monitors SSH login attempts
- fail2ban integration

**You get alerts for:**
- 🚨 IP bans (instant)
- ⚠️ Active attacks (10+ attempts in 5 min)

**Status:**
- ✅ Running every 5 minutes
- ✅ Automated, no action needed
- ✅ Telegram alerts enabled

**Files:**
- `/home/ubuntu/clawd/security-monitor.py` - Monitor script
- Logs: `/home/ubuntu/clawd/security-monitor.log`

---

## ⏰ EXISTING REMINDERS

**Already running:**
- 7:00 AM - Morning ritual (gratitude, sunlight, prayer, quote)
- 8:00 AM - Email digest
- 2:00 PM (weekdays) - Workout nudge
- 11:00 AM (weekends) - Weekend workout nudge
- 9:00 PM - DSIP sleep stack reminder
- Sunday 7:00 PM - Trash bins
- Sunday 10:00 AM - Weekly health check-in

**New additions:**
- 7:30 AM - Daily intent (what's your priority?)
- 8:00 PM - Evening review (did you do it?)
- Sunday 5:00 PM - Family connection check
- Monday 9:00 AM - Weekly biohacking research
- Monthly 1st, 10:00 AM - Habit streak report
- Monthly 1st, 6:00 PM - Financial summary

---

## 📊 QUICK COMMANDS

**Habit tracking:**
- "Show my streaks"
- "Log workout"
- "Habit progress"

**Intent tracking:**
- "What was my priority today?"
- "Show completion rate"

**Finance:**
- "How much did I spend this month?"
- "Supplement spending"

**Family:**
- "When did I last call grandma?"
- "Family birthdays"

**Research:**
- "Find emerging nootropics"
- "Tier list for [compound type]"

**Email:**
- "Important emails?"
- "Draft reply to [person]"

---

## 🛠️ HOW IT ALL WORKS

**Data storage:**
- All tracking in `/home/ubuntu/clawd/tracking/`
- JSON files (human-readable, exportable)
- You own all your data

**Automation:**
- Cron jobs for scheduled tasks
- I check systems automatically
- You get notified only when needed

**Privacy:**
- Everything stays on your server
- No external services (except email/web search)
- You can audit any file anytime

---

## 🚀 WHAT'S NEXT?

**Future additions you might want:**
- Voice message transcription
- Smart home integration
- Automated backups
- Dream journal analysis
- Calendar optimization
- RBT career development tracking
- Girlfriend relationship tracking

**Just ask and I'll build it.**

---

## 💡 TIPS

1. **Talk to me naturally** - I'll figure out what you mean
2. **Everything is logged** - Ask to see any data anytime
3. **No judgment** - I track, not nag
4. **You're in control** - Disable anything you don't want

---

*I'm constantly evolving these systems. This is your personal infrastructure.*

**Built by Asis ⚗️ for Rauli**
