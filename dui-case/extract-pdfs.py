#!/usr/bin/env python3
"""
Extract text from DUI case PDFs
Usage: python extract-pdfs.py <pdf_directory> <output_directory>
"""

import sys
import os
from pathlib import Path

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False
    try:
        import PyPDF2
        HAS_PYPDF2 = True
    except ImportError:
        HAS_PYPDF2 = False

def extract_with_fitz(pdf_path):
    """Extract text using PyMuPDF (best quality)"""
    text = []
    doc = fitz.open(pdf_path)
    for page_num, page in enumerate(doc, 1):
        text.append(f"\n--- Page {page_num} ---\n")
        text.append(page.get_text())
    doc.close()
    return ''.join(text)

def extract_with_pypdf2(pdf_path):
    """Extract text using PyPDF2 (fallback)"""
    text = []
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page_num, page in enumerate(reader.pages, 1):
            text.append(f"\n--- Page {page_num} ---\n")
            text.append(page.extract_text())
    return ''.join(text)

def extract_pdf_text(pdf_path):
    """Extract text from PDF using best available method"""
    if HAS_FITZ:
        return extract_with_fitz(pdf_path)
    elif HAS_PYPDF2:
        return extract_with_pypdf2(pdf_path)
    else:
        raise ImportError("Neither PyMuPDF nor PyPDF2 available. Install: pip install PyMuPDF")

def main():
    if len(sys.argv) < 3:
        print("Usage: python extract-pdfs.py <pdf_directory> <output_directory>")
        sys.exit(1)
    
    pdf_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Key documents to extract
    key_docs = [
        "Incident Report.pdf",
        "DUI Checklist.pdf",
        "Aff. of Refusal.pdf",
        "Information.pdf",
        "AForm.pdf",
        "MCSO Call Log.pdf",
        "Case Checklist.pdf",
        "Discovery Response.pdf"
    ]
    
    for doc_name in key_docs:
        pdf_path = pdf_dir / doc_name
        if pdf_path.exists():
            print(f"Extracting: {doc_name}")
            try:
                text = extract_pdf_text(pdf_path)
                output_file = output_dir / f"{pdf_path.stem}.txt"
                output_file.write_text(text, encoding='utf-8')
                print(f"  ✓ Saved to {output_file}")
            except Exception as e:
                print(f"  ✗ Error: {e}")
        else:
            print(f"  ⚠ Not found: {pdf_path}")
    
    print("\nExtraction complete!")

if __name__ == "__main__":
    main()
