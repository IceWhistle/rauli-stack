# TOOLS.md - Local Notes

## Gmail
- **Email:** rauliurbay@gmail.com
- **Creds:** `/home/ubuntu/clawd/.gmail-creds.json` (App Password)
- **Access:** IMAP via Python

## Google Calendar
- **Creds:** `/home/ubuntu/clawd/.gcal-credentials.json`
- **Token:** `/home/ubuntu/clawd/.gcal-token.json`
- **Helper:** `/home/ubuntu/clawd/gcal.py`
- **Usage:** `python3 gcal.py list` / `python3 gcal.py add "Event" "2026-01-27 14:00"`

## Browser Automation
- **Chrome:** `/usr/bin/google-chrome` (installed, not snap)
- **Config:** headless + no-sandbox (required for server)
- **clawd profile:** Works for automation, but cookies don't transfer to user's browser
- **chrome profile (relay):** Needs extension setup when Rauli at desktop

## Web Search
- **Provider:** Brave Search API (configured)
- **Rate limit:** Free tier, 1 req/sec

## Server
- **Location:** AWS us-east-2
- **OS:** Ubuntu 24.04
- **Disk:** 19GB total, ~8GB free
- **Firewall:** UFW (port 22 only)
- **Security:** fail2ban, SSH key-only

## TTS
- Not configured yet
- Rauli may want voice messages in future

## Rauli's Devices (Future)
- Windows gaming PC (wants to connect for optimization)
- Phone (uses Telegram from bed at night)

---
*Updated: 2026-01-26*
