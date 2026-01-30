# DUI Case Analysis - Automated Extraction Script
# Run this on Rauli-PC after installing Python packages and ffmpeg

param(
    [string]$CaseDir = "C:\Users\Admin\Documents\Discovery\25-MM-4068-AM-C-Urbay",
    [string]$OutputDir = "C:\Users\Admin\dui-analysis"
)

Write-Host "=== DUI Case Analysis for Rauli Urbay ===" -ForegroundColor Cyan
Write-Host "Case: 25-MM-4068-AM-C-Urbay" -ForegroundColor Cyan
Write-Host ""

# Create output directories
Write-Host "Creating output directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$OutputDir\extracted-text" | Out-Null
New-Item -ItemType Directory -Force -Path "$OutputDir\audio" | Out-Null
New-Item -ItemType Directory -Force -Path "$OutputDir\metadata" | Out-Null
New-Item -ItemType Directory -Force -Path "$OutputDir\logs" | Out-Null

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERROR: Python not found!" -ForegroundColor Red
    exit 1
}
Write-Host "  Python found: $($pythonCmd.Source)" -ForegroundColor Green

# Check/Install PyMuPDF
Write-Host "`nChecking Python packages..." -ForegroundColor Yellow
$packages = @("PyMuPDF", "PyPDF2")
foreach ($pkg in $packages) {
    Write-Host "  Checking $pkg..." -NoNewline
    python -c "import $($pkg.ToLower().Replace('-',''))" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host " MISSING. Installing..." -ForegroundColor Yellow
        python -m pip install --user $pkg --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " FAILED" -ForegroundColor Red
        }
    } else {
        Write-Host " OK" -ForegroundColor Green
    }
}

# Check ffmpeg
Write-Host "`nChecking ffmpeg..." -ForegroundColor Yellow
$ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegCmd) {
    Write-Host "  WARNING: ffmpeg not found!" -ForegroundColor Red
    Write-Host "  Video analysis will be skipped." -ForegroundColor Red
    Write-Host "  Install from: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor Yellow
    $skipVideo = $true
} else {
    Write-Host "  ffmpeg found: $($ffmpegCmd.Source)" -ForegroundColor Green
    $skipVideo = $false
}

# Extract PDFs
Write-Host "`n=== PHASE 1: Extracting PDFs ===" -ForegroundColor Cyan
$docsDir = Join-Path $CaseDir "Documents"
$keyDocs = @(
    "Incident Report.pdf",
    "DUI Checklist.pdf",
    "Aff. of Refusal.pdf",
    "Information.pdf",
    "AForm.pdf",
    "MCSO Call Log.pdf",
    "Case Checklist.pdf",
    "Discovery Response.pdf",
    "Certificates- L. Quick.pdf"
)

foreach ($doc in $keyDocs) {
    $pdfPath = Join-Path $docsDir $doc
    if (Test-Path $pdfPath) {
        Write-Host "Processing: $doc" -ForegroundColor Yellow
        $outputFile = Join-Path "$OutputDir\extracted-text" "$([System.IO.Path]::GetFileNameWithoutExtension($doc)).txt"
        
        # Use PyMuPDF via Python
        $pythonScript = @"
import sys
try:
    import fitz
    doc = fitz.open('$($pdfPath.Replace('\','\\'))')
    text = []
    for i, page in enumerate(doc, 1):
        text.append(f'\n--- Page {i} ---\n')
        text.append(page.get_text())
    doc.close()
    with open('$($outputFile.Replace('\','\\'))', 'w', encoding='utf-8') as f:
        f.write(''.join(text))
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
"@
        
        $result = python -c $pythonScript
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Extracted: $outputFile" -ForegroundColor Green
        } else {
            Write-Host "  FAILED: $result" -ForegroundColor Red
        }
    } else {
        Write-Host "  Not found: $doc" -ForegroundColor Red
    }
}

# Video analysis
if (-not $skipVideo) {
    Write-Host "`n=== PHASE 2: Analyzing Videos ===" -ForegroundColor Cyan
    $videosDir = Join-Path $CaseDir "Videos"
    $priorityVideos = @(
        "Gonzalez BWC (1)- FSE, arrest.mp4",
        "Rivas BWC- FSE.mp4",
        "Marino BWC- 12 empty cans.mp4",
        "L. Quick Backseat- Raul.mp4",
        "Lyda Backseat- Raul jail.mp4"
    )
    
    $videoSummary = @()
    
    foreach ($video in $priorityVideos) {
        $videoPath = Join-Path $videosDir $video
        if (Test-Path $videoPath) {
            Write-Host "Processing: $video" -ForegroundColor Yellow
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($video)
            
            # Get metadata
            Write-Host "  Extracting metadata..." -NoNewline
            $metaFile = Join-Path "$OutputDir\metadata" "$baseName.json"
            ffprobe -v quiet -print_format json -show_format -show_streams "$videoPath" > "$metaFile"
            Write-Host " OK" -ForegroundColor Green
            
            # Extract audio
            Write-Host "  Extracting audio..." -NoNewline
            $audioFile = Join-Path "$OutputDir\audio" "$baseName.mp3"
            ffmpeg -i "$videoPath" -vn -acodec libmp3lame -ar 16000 -ac 1 -b:a 64k -y "$audioFile" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host " OK" -ForegroundColor Green
            } else {
                Write-Host " FAILED" -ForegroundColor Red
            }
            
            # Parse metadata for summary
            $meta = Get-Content $metaFile | ConvertFrom-Json
            if ($meta.format) {
                $duration = [math]::Round([double]$meta.format.duration, 0)
                $sizeMB = [math]::Round((Get-Item $videoPath).Length / 1MB, 1)
                $createTime = $meta.format.tags.creation_time
                
                $videoSummary += [PSCustomObject]@{
                    Filename = $video
                    Duration = "{0:00}:{1:00}:{2:00}" -f [math]::Floor($duration/3600), [math]::Floor(($duration%3600)/60), ($duration%60)
                    SizeMB = $sizeMB
                    Created = $createTime
                }
            }
        } else {
            Write-Host "  Not found: $video" -ForegroundColor Red
        }
    }
    
    # Save video summary
    $summaryFile = Join-Path $OutputDir "video-summary.txt"
    $videoSummary | Format-Table -AutoSize | Out-String | Set-Content $summaryFile
    Write-Host "`nVideo summary saved to: $summaryFile" -ForegroundColor Green
}

# Create index file
Write-Host "`n=== Creating Analysis Index ===" -ForegroundColor Cyan
$indexFile = Join-Path $OutputDir "ANALYSIS-INDEX.txt"
$indexContent = @"
DUI CASE ANALYSIS - RAULI URBAY
Case: 25-MM-4068-AM-C-Urbay
Extraction Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

=== DOCUMENTS EXTRACTED ===
Location: $OutputDir\extracted-text\

$(Get-ChildItem "$OutputDir\extracted-text" -Filter "*.txt" | ForEach-Object {
    "  - $($_.Name) ($([math]::Round($_.Length/1KB, 1)) KB)"
})

=== VIDEOS PROCESSED ===
Location: $OutputDir\audio\

$(if (-not $skipVideo) {
    Get-ChildItem "$OutputDir\audio" -Filter "*.mp3" -ErrorAction SilentlyContinue | ForEach-Object {
        "  - $($_.Name) ($([math]::Round($_.Length/1MB, 1)) MB)"
    }
} else {
    "  [Skipped - ffmpeg not available]"
})

=== NEXT STEPS ===
1. Review extracted documents in: $OutputDir\extracted-text\
2. Start with: Incident Report.txt (full narrative)
3. Build timeline from: MCSO Call Log.txt
4. Review charges in: Information.txt
5. Check refusal details: Aff. of Refusal.txt

PRIORITY VIDEO REVIEW:
$(if (-not $skipVideo) {
    @"
1. L. Quick Backseat- Raul.mp4 - CRITICAL (statements, Miranda timing)
2. Gonzalez BWC (1)- FSE, arrest.mp4 - Field sobriety tests
3. Rivas BWC- FSE.mp4 - FSE cross-check
4. Marino BWC- 12 empty cans.mp4 - Evidence collection
5. Lyda Backseat- Raul jail.mp4 - Additional statements

Audio files ready for transcription in: $OutputDir\audio\
"@
} else {
    "[Video analysis requires ffmpeg installation]"
})

=== CRITICAL QUESTIONS TO ANSWER ===
- When exactly was Miranda read? (timestamp from backseat video)
- What statements did Rauli make before Miranda?
- Were field sobriety tests administered properly?
- What was the probable cause for the stop?
- How was the breath test refusal handled?

=== OUTPUT FOR ATTORNEY ===
Final analysis document: /home/ubuntu/clawd/case-analysis.md
"@

Set-Content -Path $indexFile -Value $indexContent
Write-Host "Analysis index created: $indexFile" -ForegroundColor Green

Write-Host "`n=== ANALYSIS COMPLETE ===" -ForegroundColor Cyan
Write-Host "Output directory: $OutputDir" -ForegroundColor Green
Write-Host "`nNext: Review extracted files and update case-analysis.md" -ForegroundColor Yellow
Write-Host ""
