#!/usr/bin/env python3
"""
Asis Model Router - Auto-switch to optimal model based on task type
Created by Asis - January 27, 2026

Usage: python3 /home/ubuntu/clawd/model-router.py [task_type] "your task here"
Or just describe your task and I'll route to the best model
"""

import sys
import json
import os
import re

# Model configuration with task routing rules
MODELS = {
    'kimi': {
        'name': 'kimi/kimi-k2.5',
        'aliases': ['kimi', 'k2.5'],
        'context': 256000,
        'strengths': ['speed', 'context_size', 'multimodal', 'cost'],
        'best_for': [
            'quick questions',
            'file organization',
            'code generation',
            'web search',
            'general chat',
            'summarization',
            'formatting',
            'routine tasks',
            'browser automation',
            'PC organization',
            'email sorting',
            'data cleanup'
        ],
        'cost': 'low',
        'speed': 'fast'
    },
    'sonnet': {
        'name': 'anthropic/claude-sonnet-4-5-20250929',
        'aliases': ['sonnet', 'claude-sonnet'],
        'context': 200000,
        'strengths': ['reasoning', 'nuance', 'legal_analysis', 'instruction_following'],
        'best_for': [
            'legal analysis',
            'complex reasoning',
            'document review',
            'strategy planning',
            'case analysis',
            'detailed research',
            'nuanced decisions',
            'technical writing',
            'code review',
            'system design',
            'debugging'
        ],
        'cost': 'medium',
        'speed': 'medium'
    },
    'opus': {
        'name': 'anthropic/claude-opus-4-5',
        'aliases': ['opus', 'claude-opus'],
        'context': 200000,
        'strengths': ['deep_reasoning', 'complex_analysis', 'creative_writing', 'max_accuracy'],
        'best_for': [
            'deep analysis',
            'complex problem solving',
            'creative writing',
            'architectural decisions',
            'difficult debugging',
            'security audits',
            'high-stakes decisions',
            'research synthesis',
            'writing important documents',
            'DUI case strategy',
            'legal motions',
            'court filings'
        ],
        'cost': 'high',
        'speed': 'slow'
    }
}

# Task type detection patterns
TASK_PATTERNS = {
    'legal': [
        r'\b(case|court|attorney|lawyer|legal|law|dui|defense|motion|filing|subpoena|discovery|evidence|miranda|testimony)\b',
        r'\b(contract|agreement|terms|liability|plaintiff|defendant|judge|prosecutor)\b',
        r'\b(25-MM-4068|Urbay|Keys Criminal|Anthony Stonick)\b'
    ],
    'complex_reasoning': [
        r'\b(analyze|synthesize|compare|evaluate|assess|determine|strategy|planning)\b',
        r'\b(why|how does|explain|break down|step by step|systematic)\b',
        r'\b(deep|thorough|comprehensive|detailed|nuanced|complex)\b'
    ],
    'creative_writing': [
        r'\b(write|draft|compose|create|generate).{0,30}(essay|story|letter|email|message|post|content)\b',
        r'\b(creative|persuasive|engaging|professional|formal|tone)\b'
    ],
    'code': [
        r'\b(code|script|function|program|develop|implement|build).{0,20}(python|javascript|bash|shell|powershell)\b',
        r'\b(debug|fix|refactor|optimize|review).{0,20}(code|script|program)\b',
        r'\b(api|database|server|backend|frontend|web|app)\b'
    ],
    'research': [
        r'\b(research|investigate|find|search|look up|what is|who is|when|where)\b',
        r'\b(about|regarding|concerning|information on|details about)\b'
    ],
    'routine': [
        r'\b(organize|sort|clean|move|rename|delete|create folder|set up)\b',
        r'\b(list|show|display|get|check|status|update|install)\b',
        r'\b(PC|computer|desktop|downloads|documents|files)\b'
    ],
    'quick': [
        r'^(hey|hi|hello|quick|fast|simple|easy|just|can you)\b',
        r'\?$',
        r'^\w{1,20}$'
    ]
}

def detect_task_type(task_description):
    """Analyze task and determine type"""
    task_lower = task_description.lower()
    
    scores = {
        'legal': 0,
        'complex_reasoning': 0,
        'creative_writing': 0,
        'code': 0,
        'research': 0,
        'routine': 0,
        'quick': 0
    }
    
    for task_type, patterns in TASK_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, task_lower, re.IGNORECASE):
                scores[task_type] += 1
    
    # Return highest scoring type
    if max(scores.values()) > 0:
        return max(scores, key=scores.get)
    return 'general'

def recommend_model(task_type, task_description):
    """Recommend best model based on task type"""
    
    # High-stakes legal work
    if task_type == 'legal':
        if any(word in task_description.lower() for word in ['strategy', 'motion', 'filing', 'important', 'critical']):
            return 'opus', 'HIGH-STAKES LEGAL - Maximum accuracy needed'
        return 'sonnet', 'LEGAL ANALYSIS - Nuanced reasoning required'
    
    # Complex reasoning
    if task_type == 'complex_reasoning':
        if any(word in task_description.lower() for word in ['deep', 'thorough', 'comprehensive', 'important']):
            return 'opus', 'DEEP ANALYSIS - Maximum reasoning capability'
        return 'sonnet', 'COMPLEX REASONING - Detailed analysis needed'
    
    # Creative writing
    if task_type == 'creative_writing':
        if any(word in task_description.lower() for word in ['professional', 'important', 'formal']):
            return 'sonnet', 'PROFESSIONAL WRITING - Quality and tone matter'
        return 'kimi', 'CREATIVE WRITING - Fast generation acceptable'
    
    # Code tasks
    if task_type == 'code':
        if any(word in task_description.lower() for word in ['debug', 'fix', 'review', 'architect', 'design']):
            return 'sonnet', 'CODE REVIEW/DEBUG - Accuracy critical'
        return 'kimi', 'CODE GENERATION - Fast and capable'
    
    # Research
    if task_type == 'research':
        if any(word in task_description.lower() for word in ['deep', 'comprehensive', 'detailed', 'thorough']):
            return 'sonnet', 'DEEP RESEARCH - Quality synthesis needed'
        return 'kimi', 'QUICK RESEARCH - Fast information retrieval'
    
    # Routine tasks
    if task_type == 'routine':
        return 'kimi', 'ROUTINE TASK - Speed optimized'
    
    # Quick questions
    if task_type == 'quick':
        return 'kimi', 'QUICK QUESTION - Minimal latency'
    
    # Default
    return 'kimi', 'GENERAL TASK - Balanced performance'

def get_model_info(model_key):
    """Get full model information"""
    return MODELS.get(model_key, MODELS['kimi'])

def main():
    """Main function"""
    print("=" * 60)
    print("ASIS MODEL ROUTER")
    print("Automatic Model Selection System")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python3 model-router.py 'your task description'")
        print("\nExamples:")
        print("  python3 model-router.py 'analyze my DUI case strategy'")
        print("  python3 model-router.py 'organize my downloads folder'")
        print("  python3 model-router.py 'write a legal motion'")
        print("\nOr simply describe your task and I'll route automatically!")
        return
    
    task_description = ' '.join(sys.argv[1:])
    
    print(f"\nTask: {task_description}")
    print("-" * 60)
    
    # Detect task type
    task_type = detect_task_type(task_description)
    print(f"Detected Task Type: {task_type.upper().replace('_', ' ')}")
    
    # Recommend model
    recommended_model, reason = recommend_model(task_type, task_description)
    model_info = get_model_info(recommended_model)
    
    print(f"\n✓ RECOMMENDED MODEL: {model_info['name']}")
    print(f"  Reason: {reason}")
    print(f"  Context Window: {model_info['context']:,} tokens")
    print(f"  Cost Level: {model_info['cost'].upper()}")
    print(f"  Speed: {model_info['speed'].upper()}")
    print(f"  Strengths: {', '.join(model_info['strengths'])}")
    
    print("\n" + "=" * 60)
    print("ALL AVAILABLE MODELS:")
    print("=" * 60)
    
    for key, model in MODELS.items():
        marker = " → " if key == recommended_model else "   "
        print(f"{marker}{key.upper():8} | {model['name'][:40]:40} | {model['speed'][:5]}")
    
    print("\n" + "=" * 60)
    print("To switch models, use /model <name>")
    print("Examples: /model sonnet  |  /model opus  |  /model kimi")
    print("=" * 60)

if __name__ == '__main__':
    main()
