#!/usr/bin/env python3
"""
Security Monitor - Alerts for SSH brute force attempts
Monitors fail2ban and SSH logs, sends Telegram alerts via Clawdbot
"""

import subprocess
import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

WORKSPACE = Path("/home/ubuntu/clawd")
STATE_FILE = WORKSPACE / ".security-monitor-state"
ALERT_FILE = WORKSPACE / ".last-attack-alert"
FAIL2BAN_LOG = Path("/var/log/fail2ban.log")

def send_alert(message):
    """Send alert via Clawdbot wake event"""
    try:
        wake_payload = {
            "systemEvent": {
                "text": message,
                "deliver": True,
                "channel": "telegram",
                "to": "7687573370"
            }
        }
        
        # Write wake event to trigger Clawdbot
        wake_file = WORKSPACE / f".wake-{int(time.time())}.json"
        wake_file.write_text(json.dumps(wake_payload))
        
        # Trigger wake via cron API
        subprocess.run([
            "curl", "-s", "-X", "POST",
            "http://100.90.148.32:18789/api/cron/wake",
            "-H", "Content-Type: application/json",
            "-d", json.dumps({"text": message})
        ], capture_output=True)
        
        # Clean up wake file after a delay
        time.sleep(2)
        if wake_file.exists():
            wake_file.unlink()
            
    except Exception as e:
        print(f"Error sending alert: {e}")

def check_fail2ban_bans():
    """Check for new fail2ban bans"""
    if not FAIL2BAN_LOG.exists():
        return
    
    # Initialize state
    if not STATE_FILE.exists():
        STATE_FILE.write_text("0")
    
    last_line = int(STATE_FILE.read_text().strip())
    current_lines = sum(1 for _ in FAIL2BAN_LOG.open())
    
    if current_lines > last_line:
        # Read new lines
        with FAIL2BAN_LOG.open() as f:
            for i, line in enumerate(f):
                if i < last_line:
                    continue
                    
                if "Ban " in line and "sshd" in line:
                    # Extract IP
                    parts = line.split()
                    ip = None
                    for i, part in enumerate(parts):
                        if part == "Ban":
                            ip = parts[i + 1] if i + 1 < len(parts) else None
                            break
                    
                    if ip:
                        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        message = f"""🚨 *SECURITY ALERT*

*IP BANNED:* `{ip}`
*Time:* {timestamp}
*Reason:* SSH brute force detected

fail2ban automatically blocked this attacker. No action needed - your server is secure."""
                        
                        send_alert(message)
        
        # Update state
        STATE_FILE.write_text(str(current_lines))

def check_active_attacks():
    """Check for active SSH attack patterns"""
    try:
        # Get failed login attempts from last 5 minutes
        result = subprocess.run([
            "sudo", "journalctl", "-u", "sshd",
            "--since", "5 minutes ago"
        ], capture_output=True, text=True)
        
        failed_count = result.stdout.count("Failed password") + result.stdout.count("Invalid user")
        
        if failed_count > 10:
            # Check if we alerted recently (within 30 minutes)
            should_alert = True
            current_time = time.time()
            
            if ALERT_FILE.exists():
                last_alert = float(ALERT_FILE.read_text().strip())
                if current_time - last_alert < 1800:  # 30 minutes
                    should_alert = False
            
            if should_alert:
                message = f"""⚠️ *ACTIVE ATTACK DETECTED*

*Failed login attempts:* {failed_count} in last 5 minutes

fail2ban is actively monitoring and will auto-ban after threshold.

Your server is secure - just keeping you informed."""
                
                send_alert(message)
                ALERT_FILE.write_text(str(current_time))
                
    except Exception as e:
        print(f"Error checking attacks: {e}")

def main():
    """Main monitoring function"""
    check_fail2ban_bans()
    check_active_attacks()

if __name__ == "__main__":
    main()
