#!/bin/bash
# Download PDFs from Windows PC HTTP server and extract text
# Usage: ./download_and_extract.sh [windows_ip] [port]

WINDOWS_IP="${1:-100.112.71.105}"
PORT="${2:-8765}"
BASE_URL="http://${WINDOWS_IP}:${PORT}"
DOWNLOAD_DIR="/tmp/dui_case_pdfs"
OUTPUT_FILE="/tmp/document-analysis.txt"

echo "========================================"
echo "DUI Case PDF Downloader & Extractor"
echo "========================================"
echo ""

# Create download directory
mkdir -p "$DOWNLOAD_DIR"
cd "$DOWNLOAD_DIR" || exit 1

# Priority documents
DOCS=(
    "Incident Report.pdf"
    "Aff. of Refusal.pdf"
    "DUI Checklist.pdf"
    "Information.pdf"
    "AForm.pdf"
    "MCSO Call Log.pdf"
    "Certificates- L. Quick.pdf"
)

echo "Downloading PDFs from $BASE_URL..."
echo ""

# Download each PDF
for doc in "${DOCS[@]}"; do
    encoded_doc=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$doc'))")
    url="${BASE_URL}/${encoded_doc}"
    
    echo "Downloading: $doc"
    if curl -f -s -o "$doc" "$url"; then
        echo "  ✓ Downloaded"
    else
        echo "  ✗ Failed to download"
    fi
done

echo ""
echo "Extracting text from PDFs..."
echo ""

# Run the Python extractor
if [ -f "/home/ubuntu/clawd/extract_dui_pdfs.py" ]; then
    python3 /home/ubuntu/clawd/extract_dui_pdfs.py "$DOWNLOAD_DIR"
    
    # Copy analysis to specified location
    if [ -f "/tmp/document-analysis.txt" ]; then
        cp /tmp/document-analysis.txt "$OUTPUT_FILE"
        echo ""
        echo "========================================"
        echo "✓ Analysis complete!"
        echo "✓ Output: $OUTPUT_FILE"
        echo "========================================"
        echo ""
        
        # Display first few lines
        head -n 50 "$OUTPUT_FILE"
        echo ""
        echo "[... truncated, see full file for complete analysis ...]"
    fi
else
    echo "ERROR: extract_dui_pdfs.py not found"
    exit 1
fi
