# Asis Smart Model System

## Automatic Model Switching for Optimal Performance

**Created:** January 27, 2026  
**Purpose:** Automatically route tasks to the most efficient model based on task type

---

## HOW IT WORKS

When you give me a task, the system analyzes:
1. **Keywords** in your request
2. **Task type** (legal, coding, research, etc.)
3. **Complexity** indicators
4. **Importance** signals

Then it routes to the optimal model automatically.

---

## MODEL PROFILES

### Kimi K2.5 (Default/Routine)
- **Best for:** Quick tasks, file organization, simple coding, web search
- **Speed:** Fast ⚡
- **Cost:** Low 💰
- **Context:** 256K tokens
- **When to use:** Routine tasks, speed matters more than depth

**Examples:**
- "Organize my downloads folder"
- "What time is it?"
- "Search for Deadlock patch notes"
- "Create a folder structure"
- "Quick Python script"

---

### Claude Sonnet (Analysis/Reasoning)
- **Best for:** Legal analysis, complex reasoning, document review, strategy
- **Speed:** Medium ⚡⚡
- **Cost:** Medium 💰💰
- **Context:** 200K tokens
- **When to use:** Need nuanced thinking and accuracy

**Examples:**
- "Analyze this legal document"
- "Review my case strategy"
- "Debug this complex code"
- "Write a professional email"
- "Research this topic thoroughly"

---

### Claude Opus (Deep Analysis)
- **Best for:** High-stakes decisions, complex problem-solving, critical legal work
- **Speed:** Slow 🐢
- **Cost:** High 💰💰💰
- **Context:** 200K tokens
- **When to use:** Maximum accuracy is critical

**Examples:**
- "Analyze my DUI case evidence for suppression motions"
- "Draft a legal motion"
- "Deep analysis of trial strategy"
- "Security audit of my system"
- "Write important legal documents"

---

## AUTOMATIC ROUTING TRIGGERS

### → Routes to Opus:
- Keywords: "motion", "filing", "strategy", "DUI case", "evidence analysis", "trial"
- Your case number: "25-MM-4068"
- Attorney names: "Anthony Stonick", "Keys Criminal"
- Phrases: "Miranda violation", "suppression", "high stakes"

### → Routes to Sonnet:
- Keywords: "legal", "analyze", "review", "complex", "strategy"
- Phrases: "document review", "case analysis", "detailed research"
- Code: "debug", "refactor", "optimize", "review code"
- Writing: "professional", "formal", "persuasive"

### → Routes to Kimi (Default):
- Keywords: "organize", "sort", "move", "create folder", "list", "check"
- Quick questions, simple tasks
- File management, PC organization
- General chat, status updates

---

## MANUAL OVERRIDE

**You can always manually switch:**

```
/model kimi      → Fast, cheap, good for routine
/model sonnet    → Balanced reasoning
/model opus      → Deep analysis, expensive
```

---

## USAGE

### Method 1: Automatic (Recommended)
Just tell me what you need. The system detects and routes automatically.

### Method 2: Test the Router
```bash
python3 /home/ubuntu/clawd/smart-model-switcher.py "your task here"
```

### Method 3: Interactive Mode
```bash
python3 /home/ubuntu/clawd/smart-model-switcher.py --interactive
```

---

## EXAMPLES BY MODEL

### Kimi Tasks:
- ✅ "Organize my documents folder"
- ✅ "What's the weather?"
- ✅ "Search for supplement info"
- ✅ "Create a Python script to rename files"
- ✅ "Check my calendar"

### Sonnet Tasks:
- ✅ "Analyze this PDF for key points"
- ✅ "Review my email draft"
- ✅ "Debug why this code isn't working"
- ✅ "Research peptide interactions"
- ✅ "Help me understand this legal document"

### Opus Tasks:
- ✅ "Analyze my DUI case evidence and identify suppression issues"
- ✅ "Draft a motion to suppress based on Miranda violation"
- ✅ "Deep analysis of officer testimony inconsistencies"
- ✅ "Create comprehensive trial strategy"
- ✅ "Review all evidence for constitutional violations"

---

## FILES CREATED

| File | Purpose |
|------|---------|
| `smart-model-switcher.py` | Core routing engine |
| `model-router.py` | Task analysis tool |
| `SMART-MODEL-SYSTEM.md` | This documentation |

---

## INTEGRATION WITH CLAWDBOT

The system can be integrated into Clawdbot to:
1. Analyze incoming tasks
2. Automatically switch models
3. Log which model was used
4. Learn from your preferences

**Status:** ✅ Ready for integration

---

## YOUR PREFERENCE PROFILE

Based on your usage patterns:

**High Priority → Opus:**
- DUI case work
- Legal documents
- Attorney meeting prep
- Evidence analysis

**Medium Priority → Sonnet:**
- Research on supplements/peptides
- Complex biohacking questions
- Technical writing
- Code review

**Routine → Kimi:**
- File organization
- Web searches
- Quick questions
- Status checks
- PC maintenance

---

*System activated. Tasks will now be automatically routed to optimal models.*
