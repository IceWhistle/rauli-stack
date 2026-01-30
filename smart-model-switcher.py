#!/usr/bin/env python3
"""
Asis Smart Model Switcher
Auto-detects task type and switches to optimal model

This script integrates with Clawdbot to automatically route tasks
to the most efficient model based on content analysis.

Usage: Integrate into Clawdbot workflow for automatic model switching
"""

import json
import os
import re
import sys

# Model configuration
MODELS = {
    'kimi': {
        'full_name': 'kimi/kimi-k2.5',
        'aliases': ['kimi', 'k2.5'],
        'speed': 'fast',
        'cost': 'low',
        'context': 256000,
        'best_for': [
            'quick questions', 'file organization', 'code generation',
            'web search', 'general chat', 'summarization', 'formatting',
            'routine tasks', 'browser automation', 'PC organization',
            'email sorting', 'data cleanup', 'simple scripting',
            'status checks', 'folder creation', 'file moving'
        ]
    },
    'sonnet': {
        'full_name': 'anthropic/claude-sonnet-4-5-20250929',
        'aliases': ['sonnet', 'claude-sonnet'],
        'speed': 'medium',
        'cost': 'medium',
        'context': 200000,
        'best_for': [
            'legal analysis', 'complex reasoning', 'document review',
            'strategy planning', 'case analysis', 'detailed research',
            'nuanced decisions', 'technical writing', 'code review',
            'system design', 'debugging', 'policy analysis'
        ]
    },
    'opus': {
        'full_name': 'anthropic/claude-opus-4-5',
        'aliases': ['opus', 'claude-opus'],
        'speed': 'slow',
        'cost': 'high',
        'context': 200000,
        'best_for': [
            'deep analysis', 'complex problem solving', 'creative writing',
            'architectural decisions', 'difficult debugging',
            'security audits', 'high-stakes decisions',
            'research synthesis', 'writing important documents',
            'DUI case strategy', 'legal motions', 'court filings',
            'evidence analysis', 'trial preparation'
        ]
    }
}

# Task pattern detection
TASK_PATTERNS = {
    'high_stakes_legal': {
        'patterns': [
            r'\b(motion|filing|strategy|defense|court|trial|suppression|evidence analysis)\b',
            r'\b(DUI case|legal strategy|case analysis|attorney meeting|case review)\b',
            r'\b(25-MM-4068|Anthony Stonick|Keys Criminal|Miranda)\b'
        ],
        'model': 'opus',
        'reason': 'High-stakes legal work requires maximum accuracy'
    },
    'legal_analysis': {
        'patterns': [
            r'\b(legal|law|case|attorney|lawyer|contract|agreement|liability)\b',
            r'\b(analyze|review).{0,20}(document|evidence|testimony)\b',
            r'\b(plaintiff|defendant|prosecution|defense)\b'
        ],
        'model': 'sonnet',
        'reason': 'Legal analysis benefits from nuanced reasoning'
    },
    'complex_analysis': {
        'patterns': [
            r'\b(deep|thorough|comprehensive|detailed|complex|sophisticated)\b',
            r'\b(analyze|synthesize|evaluate|assess|determine|compare).{0,30}(deeply|thoroughly|carefully)\b',
            r'\b(reasoning|logic|rationale|justification)\b',
            r'\b(system design|architecture|framework|methodology)\b'
        ],
        'model': 'sonnet',
        'reason': 'Complex analysis needs strong reasoning'
    },
    'creative_writing': {
        'patterns': [
            r'\b(write|draft|compose).{0,30}(letter|email|message|essay|article|content)\b',
            r'\b(professional|formal|persuasive|engaging|creative).{0,20}(writing|tone|style)\b'
        ],
        'model': 'sonnet',
        'reason': 'Writing quality benefits from nuanced language'
    },
    'code_complex': {
        'patterns': [
            r'\b(debug|fix|refactor|optimize|review).{0,20}(code|bug|issue|problem)\b',
            r'\b(architect|design|implement).{0,20}(system|framework|solution)\b',
            r'\b(security|performance|scalability|reliability)\b'
        ],
        'model': 'sonnet',
        'reason': 'Code review/debug needs accuracy'
    },
    'code_simple': {
        'patterns': [
            r'\b(write|create|generate|make).{0,20}(script|function|code|program)\b',
            r'\b(python|bash|powershell|javascript).{0,20}(script|automation)\b'
        ],
        'model': 'kimi',
        'reason': 'Code generation - fast and capable'
    },
    'research_deep': {
        'patterns': [
            r'\b(research|investigate).{0,30}(deeply|thoroughly|comprehensively|in detail)\b',
            r'\b(find|discover|explore).{0,20}(everything|all|comprehensive|detailed)\b'
        ],
        'model': 'sonnet',
        'reason': 'Deep research needs quality synthesis'
    },
    'research_quick': {
        'patterns': [
            r'\b(look up|search|find|what is|who is|when|where|how)\b',
            r'\b(quick|fast|brief).{0,20}(search|lookup|info|information)\b'
        ],
        'model': 'kimi',
        'reason': 'Quick research - fast retrieval'
    },
    'routine_task': {
        'patterns': [
            r'\b(organize|sort|clean|move|rename|delete|create|set up).{0,20}(folder|file|directory)\b',
            r'\b(download|upload|copy|paste|move).{0,20}(file|files|folder)\b',
            r'\b(PC|computer|desktop|downloads|documents|organize)\b',
            r'\b(list|show|display|get|check|status|update|install)\b'
        ],
        'model': 'kimi',
        'reason': 'Routine tasks - speed optimized'
    },
    'simple_question': {
        'patterns': [
            r'^\s*(hey|hi|hello|quick|just|can you|could you)\b',
            r'\?$',
            r'^\w{1,30}\s*\?\s*$'
        ],
        'model': 'kimi',
        'reason': 'Quick question - minimal latency'
    }
}

def analyze_task(task_text):
    """Analyze task and return recommended model with reasoning"""
    task_lower = task_text.lower()
    
    # Check each pattern category
    for category, config in TASK_PATTERNS.items():
        for pattern in config['patterns']:
            if re.search(pattern, task_lower, re.IGNORECASE):
                return {
                    'model': config['model'],
                    'reason': config['reason'],
                    'category': category.replace('_', ' ').title()
                }
    
    # Default to kimi for general tasks
    return {
        'model': 'kimi',
        'reason': 'General task - balanced performance',
        'category': 'General'
    }

def get_model_command(model_key):
    """Get the /model command for a given model key"""
    model = MODELS.get(model_key, MODELS['kimi'])
    return f"/model {model['aliases'][0]}"

def print_recommendation(task_text, recommendation):
    """Print formatted recommendation"""
    model_key = recommendation['model']
    model = MODELS[model_key]
    
    print("=" * 60)
    print("ASIS MODEL ROUTER")
    print("=" * 60)
    print(f"\nTask: {task_text[:60]}{'...' if len(task_text) > 60 else ''}")
    print(f"Category: {recommendation['category']}")
    print("-" * 60)
    print(f"\n✓ RECOMMENDED: {model_key.upper()}")
    print(f"  Model: {model['full_name']}")
    print(f"  Reason: {recommendation['reason']}")
    print(f"  Speed: {model['speed'].upper()}")
    print(f"  Cost: {model['cost'].upper()}")
    print(f"  Context: {model['context']:,} tokens")
    print(f"\n  To switch: {get_model_command(model_key)}")
    print("=" * 60)

def interactive_mode():
    """Run in interactive mode for testing"""
    print("\nAsis Model Router - Interactive Mode")
    print("Type 'exit' to quit\n")
    
    while True:
        try:
            task = input("Describe your task: ").strip()
            if task.lower() in ['exit', 'quit', 'q']:
                break
            if not task:
                continue
                
            recommendation = analyze_task(task)
            print_recommendation(task, recommendation)
            print()
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except EOFError:
            break

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python3 smart-model-switcher.py 'your task'")
        print("   or: python3 smart-model-switcher.py --interactive")
        print("\nExamples:")
        print("  python3 smart-model-switcher.py 'analyze my DUI case'")
        print("  python3 smart-model-switcher.py 'organize my folders'")
        print("  python3 smart-model-switcher.py 'write a script'")
        sys.exit(1)
    
    if sys.argv[1] == '--interactive':
        interactive_mode()
    else:
        task_text = ' '.join(sys.argv[1:])
        recommendation = analyze_task(task_text)
        print_recommendation(task_text, recommendation)
        
        # Output just the model name for scripting
        print(f"\nMODEL:{recommendation['model']}")

if __name__ == '__main__':
    main()
