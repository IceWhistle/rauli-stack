# DUI Case PDF Text Extractor - PowerShell Script
# Run this on Windows PC: powershell -ExecutionPolicy Bypass -File extract_pdfs.ps1

$pdfDir = "C:\temp\casefiles"
$outputFile = "C:\temp\document-analysis.txt"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DUI Case PDF Extractor" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Priority documents
$docs = @(
    "Incident Report.pdf",
    "Aff. of Refusal.pdf", 
    "DUI Checklist.pdf",
    "Information.pdf",
    "AForm.pdf",
    "MCSO Call Log.pdf",
    "Certificates- L. Quick.pdf"
)

# Check if directory exists
if (-not (Test-Path $pdfDir)) {
    Write-Host "ERROR: Directory not found: $pdfDir" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Output header
$output = @"
================================================================================
DUI CASE DOCUMENT ANALYSIS
Generated: $(Get-Date)
Source Directory: $pdfDir
================================================================================

"@

# Try to install Python PDF library if Python is available
try {
    $pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
    if ($pythonPath) {
        Write-Host "Python found, installing PDF libraries..." -ForegroundColor Green
        & python -m pip install pdfplumber PyPDF2 --quiet --disable-pip-version-check 2>&1 | Out-Null
        
        # Use Python to extract PDFs
        foreach ($doc in $docs) {
            $pdfPath = Join-Path $pdfDir $doc
            if (Test-Path $pdfPath) {
                Write-Host "Processing: $doc" -ForegroundColor Yellow
                
                $pythonScript = @"
import pdfplumber
import sys
try:
    with pdfplumber.open(sys.argv[1]) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            print(f'\n{"="*80}\n[PAGE {i}]\n{"="*80}\n')
            print(page.extract_text())
except Exception as e:
    print(f'ERROR: {e}')
"@
                
                $output += "`n`n################################################################################`n"
                $output += "# $doc`n"
                $output += "################################################################################`n`n"
                
                $text = & python -c $pythonScript "$pdfPath" 2>&1
                $output += $text
            } else {
                Write-Host "WARNING: Not found - $doc" -ForegroundColor Red
                $output += "`nWARNING: $doc NOT FOUND!`n"
            }
        }
    }
} catch {
    Write-Host "Python not available or extraction failed" -ForegroundColor Yellow
    Write-Host "Falling back to manual instructions..." -ForegroundColor Yellow
    
    $output += @"

NOTE: Automatic extraction failed. Python/pdfplumber not available.

MANUAL EXTRACTION REQUIRED:
Please open each PDF and copy the text content to this file.

PRIORITY DOCUMENTS TO EXTRACT:

1. Incident Report.pdf
   - Extract: Officer narrative, timeline, probable cause, impairment observations
   
2. Information.pdf  
   - Extract: All charges filed (Count I, Count II, etc.) with statute numbers

3. Aff. of Refusal.pdf
   - Extract: Breath test refusal details, what was advised, officer observations

4. DUI Checklist.pdf
   - Extract: All checked items, timing of Miranda warning, procedural steps

5. AForm.pdf
   - Extract: Arrest details, date/time, charges

6. MCSO Call Log.pdf
   - Extract: Complete timeline from dispatch to transport

7. Certificates- L. Quick.pdf
   - Extract: Officer certification dates, DUI training status

================================================================================
KEY QUESTIONS FOR ATTORNEY:
================================================================================
1. Was Miranda read before custodial interrogation? When?
2. Were Field Sobriety Tests conducted properly per NHTSA standards?
3. Was implied consent advisory given correctly and completely?
4. What was the exact timeline from stop to arrest? Any gaps?
5. Were there any procedural errors in the DUI checklist?
6. Is Officer Quick's DUI certification current and valid?
7. What was the probable cause for the initial traffic stop?
8. Were there any witnesses to the stop or arrest?
9. How was the breath test refusal documented?
10. Are there any contradictions between the incident report and other documents?
11. Were standardized field sobriety tests used?
12. Was the 20-minute observation period maintained before breath test offer?
13. Was the arrest report filled out completely and accurately?
14. Are there any Fourth Amendment issues with the stop or search?
15. Was the defendant properly advised of consequences of refusal?

"@
}

# Write output
$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Analysis Complete!" -ForegroundColor Green  
Write-Host "Output saved to: $outputFile" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Open the output file
Start-Process notepad.exe $outputFile

Write-Host "Press Enter to exit..."
Read-Host
