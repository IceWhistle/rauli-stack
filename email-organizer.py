#!/usr/bin/env python3
"""
Email Organizer for Rauli Urbay
Created by Asis - January 27, 2026

This script organizes Gmail by:
1. Categorizing emails into folders
2. Labeling important items
3. Tracking financial emails
4. Flagging legal/case-related mail
"""

import imaplib
import email
from email.header import decode_header
import json
import os
from datetime import datetime, timedelta
import re

# Load credentials
CREDS_FILE = '/home/ubuntu/clawd/.gmail-creds.json'

# Categories with keywords
CATEGORIES = {
    'Legal': {
        'keywords': ['attorney', 'court', 'case', 'subpoena', 'legal', 'lawyer', 'dui', 'defense'],
        'priority': 'URGENT',
        'action': 'notify_immediately'
    },
    'Financial': {
        'keywords': ['receipt', 'order confirmed', 'payment', 'invoice', 'charged', 'transaction'],
        'priority': 'HIGH',
        'action': 'track_spending'
    },
    'Supplements': {
        'keywords': ['shipped', 'delivered', 'tracking', 'science.bio', 'nootropics depot'],
        'senders': ['noreply@science.bio', 'support@nootropicsdepot.com'],
        'priority': 'MEDIUM',
        'action': 'track_delivery'
    },
    'Work': {
        'keywords': ['canvas', 'assignment', 'schedule', 'rbt', 'work'],
        'priority': 'HIGH',
        'action': 'flag_for_attention'
    },
    'Personal': {
        'keywords': [],
        'senders': [],  # Will detect from contacts
        'priority': 'MEDIUM',
        'action': 'organize'
    }
}

# Spam/Marketing patterns to filter
SPAM_PATTERNS = [
    'unsubscribe', 'promotional', 'marketing', 'newsletter',
    'noreply@', 'no-reply@', 'donotreply@',
    'sale', 'discount', 'offer ends'
]

def load_credentials():
    """Load Gmail credentials"""
    try:
        with open(CREDS_FILE, 'r') as f:
            creds = json.load(f)
        return creds['email'], creds['appPassword']
    except Exception as e:
        print(f"Error loading credentials: {e}")
        return None, None

def connect_to_gmail():
    """Connect to Gmail IMAP"""
    email_addr, password = load_credentials()
    if not email_addr or not password:
        return None
    
    try:
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(email_addr, password)
        print(f"✓ Connected to Gmail: {email_addr}")
        return mail
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return None

def categorize_email(subject, sender, body_preview):
    """Determine email category based on content"""
    text = f"{subject} {sender} {body_preview}".lower()
    
    for category, rules in CATEGORIES.items():
        # Check keywords
        for keyword in rules.get('keywords', []):
            if keyword.lower() in text:
                return category, rules['priority'], rules['action']
        
        # Check senders
        for sender_pattern in rules.get('senders', []):
            if sender_pattern.lower() in sender.lower():
                return category, rules['priority'], rules['action']
    
    # Check for spam
    for pattern in SPAM_PATTERNS:
        if pattern.lower() in text:
            return 'Spam', 'LOW', 'ignore'
    
    return 'Uncategorized', 'MEDIUM', 'review'

def analyze_emails(days=7, limit=100):
    """Analyze recent emails and categorize them"""
    mail = connect_to_gmail()
    if not mail:
        return None
    
    try:
        mail.select('INBOX')
        
        # Search for recent emails
        since_date = (datetime.now() - timedelta(days=days)).strftime('%d-%b-%Y')
        _, search_data = mail.search(None, f'(SINCE {since_date})')
        
        email_ids = search_data[0].split()
        email_ids = email_ids[-limit:]  # Limit to most recent
        
        results = {
            'Legal': [],
            'Financial': [],
            'Supplements': [],
            'Work': [],
            'Personal': [],
            'Spam': [],
            'Uncategorized': []
        }
        
        print(f"\nAnalyzing {len(email_ids)} emails from last {days} days...\n")
        
        for idx, email_id in enumerate(email_ids, 1):
            try:
                _, msg_data = mail.fetch(email_id, '(RFC822)')
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                # Decode subject
                subject = msg.get('Subject', '')
                if subject:
                    decoded = decode_header(subject)[0]
                    if isinstance(decoded[0], bytes):
                        subject = decoded[0].decode(decoded[1] or 'utf-8', errors='ignore')
                    else:
                        subject = decoded[0]
                
                # Get sender
                sender = msg.get('From', '')
                
                # Get date
                date = msg.get('Date', '')
                
                # Get body preview
                body_preview = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            try:
                                body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                body_preview = body[:200]
                                break
                            except:
                                pass
                else:
                    try:
                        body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                        body_preview = body[:200]
                    except:
                        pass
                
                # Categorize
                category, priority, action = categorize_email(subject, sender, body_preview)
                
                results[category].append({
                    'id': email_id.decode(),
                    'subject': subject,
                    'sender': sender,
                    'date': date,
                    'priority': priority,
                    'action': action,
                    'preview': body_preview[:100]
                })
                
                print(f"[{idx}/{len(email_ids)}] {category}: {subject[:50]}...")
                
            except Exception as e:
                print(f"Error processing email {idx}: {e}")
                continue
        
        mail.close()
        mail.logout()
        
        return results
        
    except Exception as e:
        print(f"Error analyzing emails: {e}")
        mail.logout()
        return None

def generate_report(results):
    """Generate organized report"""
    if not results:
        return
    
    print("\n" + "="*60)
    print("EMAIL ORGANIZATION REPORT")
    print("="*60)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    total = sum(len(emails) for emails in results.values())
    print(f"\nTotal Emails Analyzed: {total}\n")
    
    # Show by category
    for category, emails in results.items():
        if emails:
            print(f"\n{'='*60}")
            print(f"{category.upper()} ({len(emails)} emails)")
            print('='*60)
            
            # Sort by priority
            priority_order = {'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
            emails_sorted = sorted(emails, key=lambda x: priority_order.get(x['priority'], 99))
            
            for email_info in emails_sorted[:10]:  # Show top 10 per category
                print(f"\n[{email_info['priority']}] {email_info['subject']}")
                print(f"  From: {email_info['sender']}")
                print(f"  Date: {email_info['date']}")
                print(f"  Action: {email_info['action']}")
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for category, emails in results.items():
        if emails:
            urgent_count = sum(1 for e in emails if e['priority'] == 'URGENT')
            high_count = sum(1 for e in emails if e['priority'] == 'HIGH')
            print(f"{category}: {len(emails)} emails (URGENT: {urgent_count}, HIGH: {high_count})")
    
    print("\n" + "="*60)

def main():
    """Main function"""
    print("="*60)
    print("EMAIL ORGANIZER FOR RAULI")
    print("Created by Asis - January 27, 2026")
    print("="*60)
    
    # Check credentials exist
    if not os.path.exists(CREDS_FILE):
        print(f"\n✗ Credentials file not found: {CREDS_FILE}")
        print("Please set up Gmail credentials first.")
        return
    
    # Analyze emails
    results = analyze_emails(days=7, limit=100)
    
    if results:
        generate_report(results)
        
        # Save detailed results to file
        output_file = f'/home/ubuntu/clawd/email-analysis-{datetime.now().strftime("%Y%m%d")}.json'
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n✓ Detailed results saved to: {output_file}")
    else:
        print("\n✗ Failed to analyze emails")

if __name__ == '__main__':
    main()
