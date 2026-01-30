#!/usr/bin/env python3
"""
Extract metadata and audio from DUI case videos
Requires: ffmpeg, ffprobe
Usage: python extract-video-metadata.py <video_directory> <output_directory>
"""

import sys
import os
import json
import subprocess
from pathlib import Path
from datetime import datetime

def get_video_metadata(video_path):
    """Extract metadata using ffprobe"""
    try:
        cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            str(video_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except Exception as e:
        return {"error": str(e)}

def extract_audio(video_path, output_path, duration=None, start_time=None):
    """Extract audio from video using ffmpeg"""
    cmd = ['ffmpeg', '-i', str(video_path)]
    
    if start_time:
        cmd.extend(['-ss', str(start_time)])
    if duration:
        cmd.extend(['-t', str(duration)])
    
    cmd.extend([
        '-vn',  # No video
        '-acodec', 'libmp3lame',  # MP3 codec
        '-ar', '16000',  # 16kHz sample rate (good for speech)
        '-ac', '1',  # Mono
        '-b:a', '64k',  # 64kbps bitrate
        '-y',  # Overwrite
        str(output_path)
    ])
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        return True
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return False

def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def main():
    if len(sys.argv) < 3:
        print("Usage: python extract-video-metadata.py <video_directory> <output_directory>")
        sys.exit(1)
    
    video_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Priority videos to process
    priority_videos = [
        "Gonzalez BWC (1)- FSE, arrest.mp4",
        "Rivas BWC- FSE.mp4",
        "Marino BWC- 12 empty cans.mp4",
        "L. Quick Backseat- Raul.mp4",
        "Lyda Backseat- Raul jail.mp4"
    ]
    
    metadata_summary = []
    
    for video_name in priority_videos:
        video_path = video_dir / video_name
        if not video_path.exists():
            print(f"⚠ Not found: {video_name}")
            continue
        
        print(f"\nProcessing: {video_name}")
        
        # Get metadata
        metadata = get_video_metadata(video_path)
        
        # Save full metadata
        meta_file = output_dir / f"{video_path.stem}_metadata.json"
        with open(meta_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"  ✓ Metadata saved to {meta_file}")
        
        # Extract key info
        if 'format' in metadata:
            fmt = metadata['format']
            duration = float(fmt.get('duration', 0))
            size_mb = int(fmt.get('size', 0)) / (1024 * 1024)
            creation_time = fmt.get('tags', {}).get('creation_time', 'Unknown')
            
            summary = {
                'filename': video_name,
                'duration': format_timestamp(duration),
                'duration_seconds': duration,
                'size_mb': round(size_mb, 1),
                'creation_time': creation_time
            }
            metadata_summary.append(summary)
            
            print(f"  Duration: {summary['duration']}")
            print(f"  Size: {summary['size_mb']} MB")
            print(f"  Created: {creation_time}")
        
        # Extract audio for transcription
        audio_file = output_dir / f"{video_path.stem}.mp3"
        print(f"  Extracting audio to {audio_file.name}...")
        
        if extract_audio(video_path, audio_file):
            print(f"  ✓ Audio extracted")
        else:
            print(f"  ✗ Audio extraction failed")
    
    # Save summary
    summary_file = output_dir / "video_summary.json"
    with open(summary_file, 'w') as f:
        json.dump(metadata_summary, f, indent=2)
    print(f"\n✓ Summary saved to {summary_file}")

if __name__ == "__main__":
    main()
