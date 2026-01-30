#!/usr/bin/env python3
"""Google Calendar helper script"""

import sys
import json
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

TOKEN_FILE = '/home/ubuntu/clawd/.gcal-token.json'
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events']

def get_service():
    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    return build('calendar', 'v3', credentials=creds)

def list_events(days=7):
    service = get_service()
    now = datetime.utcnow().isoformat() + 'Z'
    future = (datetime.utcnow() + timedelta(days=days)).isoformat() + 'Z'
    
    events_result = service.events().list(
        calendarId='primary',
        timeMin=now,
        timeMax=future,
        maxResults=20,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    events = events_result.get('items', [])
    
    if not events:
        print('No upcoming events found.')
        return
    
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        print(f"{start}: {event['summary']}")

def add_event(summary, start_time, end_time, description=''):
    service = get_service()
    event = {
        'summary': summary,
        'description': description,
        'start': {'dateTime': start_time, 'timeZone': 'America/New_York'},
        'end': {'dateTime': end_time, 'timeZone': 'America/New_York'},
    }
    event = service.events().insert(calendarId='primary', body=event).execute()
    print(f"Event created: {event.get('htmlLink')}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: gcal.py [list|add] ...")
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == 'list':
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
        list_events(days)
    elif cmd == 'add':
        if len(sys.argv) < 5:
            print("Usage: gcal.py add 'Summary' 'start_iso' 'end_iso' ['description']")
            sys.exit(1)
        desc = sys.argv[5] if len(sys.argv) > 5 else ''
        add_event(sys.argv[2], sys.argv[3], sys.argv[4], desc)
    else:
        print(f"Unknown command: {cmd}")
