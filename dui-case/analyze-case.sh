#!/bin/bash
# Master script to analyze DUI case
# Run this from the Windows PC node

set -e

CASE_DIR="C:\\Users\\Admin\\Documents\\Discovery\\25-MM-4068-AM-C-Urbay"
DOCS_DIR="$CASE_DIR\\Documents"
VIDEOS_DIR="$CASE_DIR\\Videos"
OUTPUT_DIR="C:\\Users\\Admin\\dui-analysis"

echo "=== DUI Case Analysis for Rauli Urbay (25-MM-4068-AM-C-Urbay) ==="
echo ""

# Create output directories
mkdir -p "$OUTPUT_DIR/extracted-text"
mkdir -p "$OUTPUT_DIR/audio"
mkdir -p "$OUTPUT_DIR/metadata"

echo "Step 1: Installing dependencies..."
python -m pip install --user PyMuPDF --quiet || echo "PyMuPDF install failed, trying PyPDF2..."
python -m pip install --user PyPDF2 --quiet || echo "Warning: No PDF library installed"

echo ""
echo "Step 2: Extracting PDF documents..."
python extract-pdfs.py "$DOCS_DIR" "$OUTPUT_DIR/extracted-text"

echo ""
echo "Step 3: Checking for ffmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg not found. Attempting to download portable version..."
    # Download ffmpeg portable if not available
    # This would need to be implemented based on Windows specifics
    echo "Manual ffmpeg installation required: https://www.gyan.dev/ffmpeg/builds/"
else
    echo "ffmpeg found: $(which ffmpeg)"
    echo ""
    echo "Step 4: Extracting video metadata and audio..."
    python extract-video-metadata.py "$VIDEOS_DIR" "$OUTPUT_DIR"
fi

echo ""
echo "=== Analysis complete! ==="
echo "Output location: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Review extracted text files in $OUTPUT_DIR/extracted-text"
echo "2. Review video metadata in $OUTPUT_DIR/metadata"
echo "3. Transcribe audio files in $OUTPUT_DIR/audio"
echo "4. Compile case-analysis.md"
