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