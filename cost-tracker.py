#!/usr/bin/env python3
"""
Daily Cost Tracker for Asis
Tracks token usage and costs per day
"""

import json
import os
from datetime import datetime

DATA_FILE = '/home/ubuntu/clawd/.daily-costs.json'

# Pricing per 1M tokens
PRICING = {
    'kimi/kimi-k2.5': {'input': 0.50, 'output': 2.00},
    'anthropic/claude-sonnet-4-5-20250929': {'input': 3.00, 'output': 15.00},
    'anthropic/claude-opus-4-5': {'input': 15.00, 'output': 75.00}
}

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_today():
    return datetime.now().strftime('%Y-%m-%d')

def add_usage(model, input_tokens, output_tokens):
    """Add usage for current day"""
    data = load_data()
    today = get_today()
    
    if today not in data:
        data[today] = {'usage': {}, 'total_cost': 0}
    
    if model not in data[today]['usage']:
        data[today]['usage'][model] = {'input': 0, 'output': 0, 'cost': 0}
    
    data[today]['usage'][model]['input'] += input_tokens
    data[today]['usage'][model]['output'] += output_tokens
    
    # Calculate cost
    pricing = PRICING.get(model, {'input': 1.00, 'output': 3.00})
    input_cost = (input_tokens / 1_000_000) * pricing['input']
    output_cost = (output_tokens / 1_000_000) * pricing['output']
    cost = input_cost + output_cost
    
    data[today]['usage'][model]['cost'] += cost
    data[today]['total_cost'] += cost
    
    save_data(data)
    return cost

def get_today_cost():
    """Get today's total cost"""
    data = load_data()
    today = get_today()
    return data.get(today, {}).get('total_cost', 0)

def get_today_usage():
    """Get today's detailed usage"""
    data = load_data()
    today = get_today()
    return data.get(today, {})

def report():
    """Print daily report"""
    today = get_today()
    usage = get_today_usage()
    
    if not usage:
        print(f"No usage today ({today})")
        return
    
    print(f"\n📊 DAILY COST REPORT - {today}")
    print(f"Total: ${usage['total_cost']:.4f}")
    print(f"Budget: $2.00 | Remaining: ${2.00 - usage['total_cost']:.2f}")
    print("\nBy Model:")
    for model, stats in usage['usage'].items():
        print(f"  {model.split('/')[-1]:20} | ${stats['cost']:.4f} | {stats['input']+stats['output']:,} tokens")

if __name__ == '__main__':
    report()
