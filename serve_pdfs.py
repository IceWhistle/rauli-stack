#!/usr/bin/env python3
"""
Simple HTTP server to serve PDFs for remote extraction
Run on Windows PC: python serve_pdfs.py
Then access from Ubuntu server via Tailscale IP
"""

import http.server
import socketserver
import os
import sys

PORT = 8765
DIRECTORY = r"C:\temp\casefiles" if sys.platform == "win32" else "/tmp/casefiles"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == "__main__":
    if not os.path.exists(DIRECTORY):
        print(f"ERROR: Directory not found: {DIRECTORY}")
        sys.exit(1)
    
    print("=" * 60)
    print("PDF Server Starting...")
    print("=" * 60)
    print(f"Serving directory: {DIRECTORY}")
    print(f"Port: {PORT}")
    print("")
    print("Access PDFs at:")
    print(f"  http://localhost:{PORT}/")
    print("")
    print("To access from Tailscale network:")
    print(f"  http://100.112.71.105:{PORT}/")
    print("")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
