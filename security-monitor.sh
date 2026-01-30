#!/bin/bash
# Security Monitor - Alerts for brute force attempts
# Sends Telegram notifications via Clawdbot

LOGFILE="/var/log/fail2ban.log"
STATEFILE="/home/ubuntu/clawd/.security-monitor-state"
GATEWAY="http://100.90.148.32:18789"

# Initialize state file if it doesn't exist
if [ ! -f "$STATEFILE" ]; then
    echo "0" > "$STATEFILE"
fi

LAST_LINE=$(cat "$STATEFILE")

# Get new ban events since last check
CURRENT_LINE=$(wc -l < "$LOGFILE")

if [ "$CURRENT_LINE" -gt "$LAST_LINE" ]; then
    # Extract new lines
    NEW_BANS=$(tail -n +$((LAST_LINE + 1)) "$LOGFILE" | grep "Ban\|Unban")
    
    if [ -n "$NEW_BANS" ]; then
        # Parse bans
        while IFS= read -r line; do
            if echo "$line" | grep -q "Ban"; then
                IP=$(echo "$line" | grep -oP '\d+\.\d+\.\d+\.\d+')
                TIMESTAMP=$(echo "$line" | awk '{print $1, $2}')
                
                MESSAGE="🚨 *SECURITY ALERT*

*IP BANNED:* \`$IP\`
*Time:* $TIMESTAMP
*Reason:* SSH brute force attempt detected

Your server just blocked this attacker automatically. No action needed."

                # Send via Clawdbot message tool
                curl -s -X POST "$GATEWAY/api/message/send" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"target\": \"7687573370\",
                        \"message\": $(echo "$MESSAGE" | jq -Rs .),
                        \"channel\": \"telegram\"
                    }" > /dev/null 2>&1
                
            fi
        done <<< "$NEW_BANS"
    fi
    
    # Update state
    echo "$CURRENT_LINE" > "$STATEFILE"
fi

# Check for current attack patterns (multiple failed attempts in last 5 min)
RECENT_FAILS=$(sudo journalctl -u sshd --since "5 minutes ago" | grep -c "Failed password\|Invalid user" || echo 0)

if [ "$RECENT_FAILS" -gt 10 ]; then
    # Check if we already alerted recently
    ALERT_FILE="/home/ubuntu/clawd/.last-attack-alert"
    CURRENT_TIME=$(date +%s)
    
    if [ -f "$ALERT_FILE" ]; then
        LAST_ALERT=$(cat "$ALERT_FILE")
        TIME_DIFF=$((CURRENT_TIME - LAST_ALERT))
        
        # Only alert if it's been more than 30 minutes since last alert
        if [ "$TIME_DIFF" -gt 1800 ]; then
            SHOULD_ALERT=1
        else
            SHOULD_ALERT=0
        fi
    else
        SHOULD_ALERT=1
    fi
    
    if [ "$SHOULD_ALERT" -eq 1 ]; then
        MESSAGE="⚠️ *ACTIVE ATTACK DETECTED*

*Failed login attempts:* $RECENT_FAILS in last 5 minutes

fail2ban is actively monitoring and will auto-ban after threshold.

Server is secure - just keeping you informed."

        curl -s -X POST "$GATEWAY/api/message/send" \
            -H "Content-Type: application/json" \
            -d "{
                \"target\": \"7687573370\",
                \"message\": $(echo "$MESSAGE" | jq -Rs .),
                \"channel\": \"telegram\"
            }" > /dev/null 2>&1
        
        echo "$CURRENT_TIME" > "$ALERT_FILE"
    fi
fi
