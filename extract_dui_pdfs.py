#!/usr/bin/env python3
"""
DUI Case PDF Extractor - Extracts and analyzes critical documents from Rauli's DUI case
"""

import sys
import os
from pathlib import Path
try:
    import pdfplumber
    USE_PDFPLUMBER = True
except ImportError:
    USE_PDFPLUMBER = False
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        print("ERROR: Neither pdfplumber nor PyPDF2 is installed!")
        print("Install with: pip install pdfplumber PyPDF2")
        sys.exit(1)

# Priority documents in order
PRIORITY_DOCS = [
    "Incident Report.pdf",
    "Aff. of Refusal.pdf",
    "DUI Checklist.pdf",
    "Information.pdf",
    "AForm.pdf",
    "MCSO Call Log.pdf",
    "Certificates- L. Quick.pdf"
]

def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber (preferred method)"""
    text = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text.append(f"\n{'='*80}\n[PAGE {i}]\n{'='*80}\n")
                    text.append(page_text)
        return "\n".join(text)
    except Exception as e:
        return f"ERROR extracting with pdfplumber: {str(e)}"

def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2 (fallback method)"""
    text = []
    try:
        reader = PdfReader(pdf_path)
        for i, page in enumerate(reader.pages, 1):
            page_text = page.extract_text()
            if page_text:
                text.append(f"\n{'='*80}\n[PAGE {i}]\n{'='*80}\n")
                text.append(page_text)
        return "\n".join(text)
    except Exception as e:
        return f"ERROR extracting with PyPDF2: {str(e)}"

def analyze_document(doc_name, text):
    """Analyze extracted text for key information"""
    analysis = []
    analysis.append(f"\n{'#'*80}")
    analysis.append(f"# {doc_name}")
    analysis.append(f"{'#'*80}\n")
    
    text_lower = text.lower()
    
    # Key phrase detection
    key_phrases = {
        "Officer Narrative": ["narrative", "observed", "investigated", "proceeded"],
        "Timeline/Time": ["at approximately", "at about", "hours", "time:", "date:"],
        "Probable Cause": ["probable cause", "reason to believe", "basis"],
        "Impairment Indicators": ["odor", "bloodshot", "slurred", "swaying", "unsteady", "impaired"],
        "FST/Tests": ["field sobriety", "walk and turn", "one leg stand", "hgn", "nystagmus"],
        "Refusal": ["refused", "refusal", "decline", "would not"],
        "Miranda": ["miranda", "right to remain silent", "right to attorney"],
        "Breath Test": ["breath", "intoxilyzer", "chemical test", "implied consent"],
        "Charges": ["charge", "violation", "statute", "count"],
        "Officer Info": ["officer", "deputy", "badge", "certification", "trained"]
    }
    
    found_sections = []
    for section, phrases in key_phrases.items():
        for phrase in phrases:
            if phrase in text_lower:
                found_sections.append(section)
                break
    
    if found_sections:
        analysis.append("KEY SECTIONS IDENTIFIED:")
        for section in found_sections:
            analysis.append(f"  ✓ {section}")
        analysis.append("")
    
    # Extract key quotes (lines containing critical phrases)
    analysis.append("EXTRACTED TEXT:\n")
    analysis.append(text)
    analysis.append("\n" + "="*80 + "\n")
    
    return "\n".join(analysis)

def main():
    # Determine PDF directory
    if len(sys.argv) > 1:
        pdf_dir = Path(sys.argv[1])
    else:
        # Default paths to try
        possible_paths = [
            Path(r"C:\temp\casefiles"),
            Path(r"C:\Users\Admin\Documents\casefiles"),
            Path("./casefiles"),
            Path(".")
        ]
        pdf_dir = None
        for path in possible_paths:
            if path.exists():
                pdf_dir = path
                break
        
        if pdf_dir is None:
            print("ERROR: Could not find PDF directory!")
            print("Usage: python extract_dui_pdfs.py [pdf_directory]")
            print(f"Tried: {[str(p) for p in possible_paths]}")
            sys.exit(1)
    
    print(f"Scanning directory: {pdf_dir}")
    print(f"Using: {'pdfplumber' if USE_PDFPLUMBER else 'PyPDF2'}\n")
    
    output_lines = []
    output_lines.append("="*80)
    output_lines.append("DUI CASE DOCUMENT ANALYSIS")
    output_lines.append(f"Generated: {__import__('datetime').datetime.now()}")
    output_lines.append(f"Source Directory: {pdf_dir}")
    output_lines.append("="*80 + "\n")
    
    timeline = []
    charges = []
    issues = []
    questions = []
    
    # Process priority documents
    for doc_name in PRIORITY_DOCS:
        pdf_path = pdf_dir / doc_name
        
        if not pdf_path.exists():
            output_lines.append(f"\n⚠️  WARNING: {doc_name} NOT FOUND!\n")
            issues.append(f"Missing document: {doc_name}")
            continue
        
        print(f"Processing: {doc_name}...")
        
        # Extract text
        if USE_PDFPLUMBER:
            text = extract_text_pdfplumber(pdf_path)
        else:
            text = extract_text_pypdf2(pdf_path)
        
        # Analyze
        analysis = analyze_document(doc_name, text)
        output_lines.append(analysis)
        
        # Build timeline from text
        if "incident report" in doc_name.lower():
            for line in text.split('\n'):
                if any(t in line.lower() for t in ['at approximately', 'at about', 'hours', 'time:']):
                    timeline.append(f"[Incident Report] {line.strip()}")
        
        # Extract charges
        if "information" in doc_name.lower():
            for line in text.split('\n'):
                if any(c in line.lower() for c in ['count', 'charge', 'violation', 'statute']):
                    charges.append(line.strip())
    
    # Add summary section
    output_lines.append("\n" + "="*80)
    output_lines.append("SUMMARY & ANALYSIS")
    output_lines.append("="*80 + "\n")
    
    if timeline:
        output_lines.append("TIMELINE RECONSTRUCTION:")
        for t in timeline:
            output_lines.append(f"  • {t}")
        output_lines.append("")
    
    if charges:
        output_lines.append("CHARGES FILED:")
        for c in charges:
            output_lines.append(f"  • {c}")
        output_lines.append("")
    
    if issues:
        output_lines.append("POTENTIAL ISSUES IDENTIFIED:")
        for i in issues:
            output_lines.append(f"  ⚠️  {i}")
        output_lines.append("")
    
    # Key questions to investigate
    output_lines.append("KEY QUESTIONS FOR ATTORNEY:")
    default_questions = [
        "Was Miranda read before custodial interrogation?",
        "Were FSTs conducted properly per officer training?",
        "Was implied consent advisory given correctly?",
        "What was the exact timeline from stop to arrest?",
        "Were there any procedural errors in the DUI checklist?",
        "Is the officer's certification current and valid?",
        "What was the probable cause for the initial stop?",
        "Were there any witnesses?",
        "Was the breath test refusal documented properly?",
        "Are there any contradictions in the police narrative?"
    ]
    for q in default_questions:
        output_lines.append(f"  ? {q}")
    output_lines.append("")
    
    # Write output
    output_text = "\n".join(output_lines)
    
    # Save to file
    output_path = pdf_dir.parent / "document-analysis.txt"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_text)
    
    print(f"\n✓ Analysis complete!")
    print(f"✓ Output saved to: {output_path}")
    print(f"✓ Total size: {len(output_text)} characters\n")
    
    # Also print to console
    print(output_text)

if __name__ == "__main__":
    main()
