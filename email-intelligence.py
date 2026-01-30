#!/usr/bin/env python3
"""
Email Intelligence System
Smart filtering, categorization, and response drafting
Extends the basic email digest with deeper intelligence
"""

import imaplib
import email
from email.header import decode_header
import json
from datetime import datetime, timedelta
from pathlib import Path
import re

WORKSPACE = Path("/home/ubuntu/clawd")
CREDS_FILE = WORKSPACE / ".gmail-creds.json"
EMAIL_STATE = WORKSPACE / "tracking" / "email-state.json"

# Categories for smart filtering
CATEGORIES = {
    "urgent": {
        "keywords": ["urgent", "asap", "important", "deadline", "respond", "reply needed"],
        "priority": 1
    },
    "action_required": {
        "keywords": ["confirm", "verify", "approve", "action required", "please review"],
        "priority": 2
    },
    "personal": {
        "keywords": [],  # From known contacts
        "priority": 3,
        "from_list": ["sabrinadupeiron@gmail.com"]  # Rauli can add more
    },
    "financial": {
        "keywords": ["payment", "receipt", "invoice", "subscription", "charge", "refund"],
        "priority": 4
    },
    "appointments": {
        "keywords": ["appointment", "meeting", "schedule", "calendar"],
        "priority": 5
    },
    "school": {
        "keywords": ["canvas", "assignment", "grade", "course", "instructor"],
        "priority": 6
    },
    "spam": {
        "keywords": ["unsubscribe", "promotional", "discount", "sale", "offer"],
        "priority": 99
    }
}

def categorize_email(subject, from_addr, body):
    """Categorize email by urgency and type"""
    text = f"{subject} {body}".lower()
    
    # Check each category
    for category, config in CATEGORIES.items():
        # Check keywords
        if any(keyword in text for keyword in config.get("keywords", [])):
            return category, config["priority"]
        
        # Check sender whitelist
        if "from_list" in config:
            if any(sender in from_addr.lower() for sender in config["from_list"]):
                return category, config["priority"]
    
    return "other", 50

def needs_response(subject, body):
    """Determine if email needs a response"""
    response_indicators = [
        r"\?",  # Questions
        r"please (reply|respond|let me know)",
        r"what do you think",
        r"can you",
        r"could you",
        r"would you",
        r"rsvp",
        r"confirm"
    ]
    
    text = f"{subject} {body}".lower()
    return any(re.search(pattern, text) for pattern in response_indicators)

def analyze_emails():
    """
    Analyze recent emails with intelligence:
    - Categorize by urgency/type
    - Identify emails needing responses
    - Track follow-ups needed
    - Extract financial data for tracking
    """
    
    # Load credentials
    with open(CREDS_FILE) as f:
        creds = json.load(f)
    
    # Connect to Gmail
    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login(creds['email'], creds['appPassword'])
    mail.select('INBOX')
    
    # Get unread emails
    status, messages = mail.search(None, 'UNSEEN')
    
    if status != 'OK' or not messages[0]:
        return {"status": "no_new_emails"}
    
    msg_ids = messages[0].split()
    
    results = {
        "urgent": [],
        "needs_response": [],
        "financial": [],
        "personal": [],
        "other": []
    }
    
    for msg_id in msg_ids[-20:]:  # Last 20 unread
        status, msg_data = mail.fetch(msg_id, '(RFC822)')
        
        if status != 'OK':
            continue
            
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                
                # Decode subject
                subject = msg['subject'] or ""
                if subject:
                    decoded = decode_header(subject)
                    subject = decoded[0][0]
                    if isinstance(subject, bytes):
                        subject = subject.decode()
                
                from_addr = msg['from']
                date = msg['date']
                
                # Get body
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            try:
                                body = part.get_payload(decode=True).decode()
                                break
                            except:
                                pass
                else:
                    try:
                        body = msg.get_payload(decode=True).decode()
                    except:
                        body = ""
                
                # Analyze
                category, priority = categorize_email(subject, from_addr, body)
                needs_reply = needs_response(subject, body)
                
                email_info = {
                    "from": from_addr,
                    "subject": subject,
                    "date": date,
                    "category": category,
                    "priority": priority,
                    "needs_response": needs_reply,
                    "preview": body[:200] if body else ""
                }
                
                # Sort into buckets
                if priority <= 2:
                    results["urgent"].append(email_info)
                if needs_reply:
                    results["needs_response"].append(email_info)
                if category == "financial":
                    results["financial"].append(email_info)
                if category == "personal":
                    results["personal"].append(email_info)
                else:
                    results["other"].append(email_info)
    
    mail.close()
    mail.logout()
    
    return results

if __name__ == "__main__":
    results = analyze_emails()
    print(json.dumps(results, indent=2))
