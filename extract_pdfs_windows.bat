@echo off
REM DUI Case PDF Extractor - Windows Batch File
REM Run this on the Windows PC where the PDFs are located

echo ========================================
echo DUI Case PDF Extractor
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Installing required Python packages...
pip install pdfplumber PyPDF2 --quiet

echo.
echo Extracting PDFs from C:\temp\casefiles\
echo.

REM Download and run the extraction script
curl -o "%TEMP%\extract_dui_pdfs.py" "https://raw.githubusercontent.com/raulurbay/clawd/main/extract_dui_pdfs.py" 2>nul
if errorlevel 1 (
    echo Warning: Could not download script, using local copy
    python "%~dp0extract_dui_pdfs.py" "C:\temp\casefiles"
) else (
    python "%TEMP%\extract_dui_pdfs.py" "C:\temp\casefiles"
)

echo.
echo ========================================
echo Analysis complete!
echo Output saved to: C:\temp\document-analysis.txt
echo ========================================
echo.
pause
