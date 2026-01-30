#!/usr/bin/env python3
"""
Quick Search Utility
Search across workspace files for content
"""

import os
import sys
import re
from pathlib import Path

def search_files(query, directory='/home/ubuntu/clawd', extensions=None):
    """Search for query in files"""
    if extensions is None:
        extensions = ['.md', '.txt', '.py', '.json']
    
    results = []
    query_lower = query.lower()
    
    for root, dirs, files in os.walk(directory):
        # Skip hidden dirs and common excludes
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['venv', 'node_modules', '__pycache__']]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = Path(root) / file
                try:
                    content = filepath.read_text(errors='ignore')
                    if query_lower in content.lower():
                        # Find matching lines
                        for i, line in enumerate(content.split('\n'), 1):
                            if query_lower in line.lower():
                                results.append({
                                    'file': str(filepath.relative_to(directory)),
                                    'line': i,
                                    'content': line.strip()[:100]
                                })
                except:
                    pass
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: quick-search.py <query>")
        sys.exit(1)
    
    query = ' '.join(sys.argv[1:])
    results = search_files(query)
    
    print(f"Found {len(results)} matches for '{query}':\n")
    for r in results[:20]:  # Limit output
        print(f"  {r['file']}:{r['line']}")
        print(f"    {r['content']}")
        print()
