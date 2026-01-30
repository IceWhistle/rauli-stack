#!/usr/bin/env python3
"""
News & Content Curator
Daily briefing on topics Rauli cares about
Filters signal from noise
"""

import json
from datetime import datetime
from pathlib import Path

WORKSPACE = Path("/home/ubuntu/clawd")
NEWS_DIR = WORKSPACE / "news"
NEWS_DIR.mkdir(exist_ok=True)

# Rauli's interests
INTERESTS = {
    "biohacking": {
        "keywords": ["peptides", "nootropics", "longevity", "anti-aging", "NAD+", 
                    "mitochondria", "supplements", "biohacking", "optimization"],
        "sources": [
            "r/Nootropics",
            "r/Biohacking", 
            "r/Peptides",
            "Longecity forums",
            "PubMed recent"
        ]
    },
    "gaming": {
        "keywords": ["deadlock", "valve", "dota", "moba", "esports", "gaming"],
        "sources": [
            "r/DeadlockTheGame",
            "Deadlock patch notes",
            "Steam news"
        ]
    },
    "faith": {
        "keywords": ["christianity", "jesus", "faith", "prayer", "bible", "spiritual"],
        "sources": [
            "Christian news sites",
            "Daily verse/devotional"
        ]
    },
    "health": {
        "keywords": ["fitness", "sleep", "circadian", "testosterone", "muscle", "recovery"],
        "sources": [
            "r/Fitness",
            "r/Sleep",
            "Health research"
        ]
    },
    "tech": {
        "keywords": ["AI", "optimization", "productivity", "tools"],
        "sources": [
            "Tech news",
            "Product Hunt"
        ]
    }
}

def curate_daily_news():
    """
    Curate daily news brief:
    1. Search web for keywords in each category
    2. Filter for relevance and quality
    3. Summarize key points
    4. Deliver concise briefing
    """
    
    briefing_template = f"""# Daily News Brief - {datetime.now().strftime('%A, %B %d, %Y')}

## 🧬 Biohacking & Optimization
- [ ] Search for latest peptide/nootropic discussions
- [ ] New longevity research
- [ ] Community trends

## 🎮 Gaming (Deadlock)
- [ ] Patch notes or meta changes
- [ ] Pro player updates
- [ ] Strategy discussions

## ✝️ Faith & Spiritual
- [ ] Daily verse or devotional
- [ ] Christian news
- [ ] Inspirational content

## 💪 Health & Fitness
- [ ] Sleep optimization research
- [ ] Workout science
- [ ] Recovery techniques

## 🤖 Tech & Tools
- [ ] New AI tools
- [ ] Productivity hacks
- [ ] Interesting launches

---

**Your Daily Focus:** [To be filled via morning intent]

**Quick Wins Today:**
1. [ ] Morning routine (sunlight, prayer, gratitude)
2. [ ] #1 Priority task
3. [ ] Workout
4. [ ] Sleep stack

---
*Curated specifically for Rauli - only signal, no noise*
"""
    
    # Save template
    briefing_file = NEWS_DIR / f"{datetime.now().strftime('%Y-%m-%d')}_brief.md"
    briefing_file.write_text(briefing_template)
    
    return f"News brief template created: {briefing_file}"

if __name__ == "__main__":
    result = curate_daily_news()
    print(result)
