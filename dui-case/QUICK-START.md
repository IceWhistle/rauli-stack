# Quick Start - When PC Reconnects

## Immediate Commands to Run

### 1. Check PC is online
```bash
# From main agent
nodes status
```

### 2. Install dependencies on PC
```powershell
# On Rauli-PC
python -m pip install --user PyMuPDF
python -m pip install --user PyPDF2
```

### 3. Install ffmpeg (if not present)
Download from: https://www.gyan.dev/ffmpeg/builds/
Or use winget: `winget install Gyan.FFmpeg`

### 4. Copy extraction scripts to PC
Transfer these files to PC:
- extract-pdfs.py
- extract-video-metadata.py

### 5. Run PDF extraction
```powershell
cd C:\Users\Admin\Documents\Discovery\25-MM-4068-AM-C-Urbay
python extract-pdfs.py Documents C:\Users\Admin\dui-analysis\extracted-text
```

### 6. Run video metadata extraction
```powershell
python extract-video-metadata.py Videos C:\Users\Admin\dui-analysis
```

### 7. Copy extracted files back to Linux workspace
Transfer extracted text files to:
`/home/ubuntu/clawd/dui-case/documents/`

### 8. Begin document review
Priority order:
1. Incident Report.txt - Full narrative
2. MCSO Call Log.txt - Timeline
3. Information.txt - Charges
4. Aff. of Refusal.txt - Refusal details
5. DUI Checklist.txt - Procedures
6. AForm.txt - Arrest details

### 9. Video analysis priorities
1. L. Quick Backseat- Raul.mp4 - CRITICAL (statements, Miranda)
2. Gonzalez BWC (1)- FSE, arrest.mp4 - FSE procedure
3. Rivas BWC- FSE.mp4 - FSE cross-check
4. Marino BWC- 12 empty cans.mp4 - Evidence
5. Lyda Backseat- Raul jail.mp4 - Additional statements

### 10. Update case-analysis.md
As you review each document/video, fill in the [TBD] sections in case-analysis.md

---

## Critical Focus

**Top 3 things to determine ASAP:**
1. ⚠️ **When was Miranda read?** (timestamp from L. Quick Backseat video)
2. ⚠️ **What statements did Rauli make before Miranda?** (same video)
3. ⚠️ **Were FSEs administered properly?** (Gonzalez & Rivas BWC)

---

## Fast Track (If Time Limited)

If PC comes back with < 2 hours to lawyer meeting:

### Documents (30 min)
1. Incident Report - skim for key facts
2. Information - list charges
3. Aff. of Refusal - refusal details
4. MCSO Call Log - build timeline

### Videos (60 min)
1. L. Quick Backseat (1.7GB) - MUST WATCH FULLY
   - Note every statement
   - Exact Miranda timestamp
   - Rauli's behavior
   
2. Gonzalez BWC FSE (first 20 min)
   - FSE instructions
   - Rauli's performance
   - Officer comments

3. Marino 12 cans (first 10 min)
   - Evidence location
   - Collection procedure

### Update Report (30 min)
- Fill in timeline
- List all statements
- Note procedural issues
- Compile top 10 questions

---

**Total fast-track time: ~2 hours**
