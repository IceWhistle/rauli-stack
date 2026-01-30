# EASY ASIS ACCESS SETUP
**For Rauli's Windows PC**

---

## WHAT YOU'RE GETTING

**File:** `Start-Asis-Connection.bat`  
**What it does:** Double-click → Instant connection to Asis  
**No more:** Remembering commands or typing in PowerShell

---

## SETUP INSTRUCTIONS

### Step 1: Get the File on Your PC

**Option A: Copy from Server (Easiest)**
```
1. The file is at: /home/ubuntu/clawd/Start-Asis-Connection.bat
2. Copy it to your Windows PC
3. Put it in: C:\Asis\ folder (create if needed)
```

**Option B: Create Manually**
```
1. Open Notepad on your PC
2. Copy the content below
3. Save as: C:\Asis\Start-Asis-Connection.bat
4. Make sure it ends in .bat (not .txt)
```

### Step 2: Create Desktop Shortcut

```
1. Right-click Start-Asis-Connection.bat
2. Select "Create shortcut"
3. Drag shortcut to Desktop
4. (Optional) Right-click → Properties → Change Icon
5. Use this icon path: %SystemRoot%\System32\shell32.dll, 13
```

### Step 3: Test It

```
1. Double-click the desktop shortcut
2. A black window opens
3. You should see:
   - "ASIS CONNECTION STARTER"
   - "Connecting to Asis server..."
   - "Server: 100.90.148.32:18789"
4. Connection established!
5. Leave window open while we work
```

---

## THE BATCH FILE CONTENT

**Copy this into Notepad and save as .bat:**

```batch
@echo off
title Asis Connection - Rauli's PC
color 0A
echo ==========================================
echo  ASIS CONNECTION STARTER
echo  Rauli's Personal AI Assistant
echo ==========================================
echo.

:: Check if clawdbot is installed
where clawdbot >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Clawdbot not found in PATH
    echo.
    echo Please install Clawdbot first:
    echo npm install -g clawdbot
    echo.
    pause
    exit /b 1
)

echo [OK] Clawdbot found
echo.
echo Connecting to Asis server...
echo Server: 100.90.148.32:18789
echo.
echo ==========================================
echo.

:: Run the connection command
clawdbot node run --host 100.90.148.32 --port 18789

:: If connection fails, show error
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Connection failed
    echo.
    echo Troubleshooting:
    echo 1. Check internet connection
    echo 2. Verify Tailscale is connected
    echo 3. Try restarting this script
    echo.
    pause
    exit /b 1
)

:: Keep window open
echo.
echo ==========================================
echo Connection closed.
echo.
pause
```

---

## WHAT THE SCRIPT DOES

### Features:

✅ **Checks Requirements**
- Verifies Clawdbot is installed
- Shows error if not found

✅ **Visual Feedback**
- Green text (easy on eyes)
- Clear status messages
- Shows server address

✅ **Error Handling**
- Detects connection failures
- Shows troubleshooting steps
- Doesn't just disappear

✅ **User Friendly**
- Keeps window open
- Shows "Connection closed" message
- Press any key to close

---

## TROUBLESHOOTING

### "Clawdbot not found"
```
Fix: Install Clawdbot
npm install -g clawdbot
```

### "Connection failed"
```
Check:
1. Is Tailscale connected? (Look for icon in system tray)
2. Is internet working?
3. Try restarting the script
```

### Window closes immediately
```
This means connection failed
The script should show error message
If not, run from PowerShell to see errors
```

---

## PRO TIP: PIN TO TASKBAR

```
1. Right-click desktop shortcut
2. "Pin to taskbar"
3. Now it's always one click away
```

---

## ALTERNATIVE: POWER SHELL VERSION

**If you prefer PowerShell:**

Create `Start-Asis-Connection.ps1`:

```powershell
Write-Host "==========================================" -ForegroundColor Green
Write-Host " ASIS CONNECTION STARTER" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check clawdbot
try {
    $clawdbot = Get-Command clawdbot -ErrorAction Stop
    Write-Host "[OK] Clawdbot found" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Clawdbot not found" -ForegroundColor Red
    Write-Host "Install: npm install -g clawdbot"
    pause
    exit 1
}

Write-Host ""
Write-Host "Connecting to Asis server..." -ForegroundColor Cyan
Write-Host "Server: 100.90.148.32:18789"
Write-Host ""

# Connect
clawdbot node run --host 100.90.148.32 --port 18789

Write-Host ""
Write-Host "Connection closed." -ForegroundColor Yellow
pause
```

---

## YOU'RE ALL SET!

**From now on:**
1. Double-click desktop shortcut
2. Window opens and connects
3. Leave it running
4. I can access your PC
5. When done, close the window

**No more remembering commands!**

---

**Created by:** Asis ⚗️  
**Date:** January 27, 2026  
**Status:** Ready to deploy
