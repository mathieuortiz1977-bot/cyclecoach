#!/bin/bash

# CONVERT ALL 165 WORKOUTS TO PERCENTAGE-BASED DURATIONS
# This uses Python to parse and convert each workout carefully

python3 << 'PYTHON'
import re
from pathlib import Path

def convert_file(filepath):
    content = Path(filepath).read_text()
    lines = content.split('\n')
    
    converted = 0
    for workout_num, line_idx in enumerate(range(len(lines))):
        line = lines[line_idx]
        
        # Find workout starts (id: '...' or id: "...")
        if 'id:' in line and ('intervals: () => [' in '\n'.join(lines[line_idx:line_idx+20])):
            # Find the intervals block
            intervals_start = None
            for i in range(line_idx, min(line_idx + 50, len(lines))):
                if 'intervals: () => [' in lines[i]:
                    intervals_start = i
                    break
            
            if intervals_start is None:
                continue
            
            # Find the closing bracket
            brace_count = 0
            intervals_end = None
            for i in range(intervals_start, min(intervals_start + 100, len(lines))):
                brace_count += lines[i].count('[') - lines[i].count(']')
                if brace_count == 0 and i > intervals_start:
                    intervals_end = i
                    break
            
            if intervals_end is None:
                continue
            
            # Get the intervals section
            intervals_section = '\n'.join(lines[intervals_start:intervals_end+1])
            
            # Extract all durationSecs values
            durations = re.findall(r'durationSecs:\s*(\d+)', intervals_section)
            if not durations:
                continue
            
            total_secs = sum(int(d) for d in durations)
            
            # Calculate percentages
            percent_map = {}
            for d_str in durations:
                d = int(d_str)
                pct = round((d / total_secs) * 100) if total_secs > 0 else 0
                if d not in percent_map:
                    percent_map[d] = pct
            
            # Replace durationSecs with durationPercent
            new_section = intervals_section
            for secs_str, pct in percent_map.items():
                # Be careful to replace in the right context
                old_pattern = f'durationSecs: {secs_str}'
                new_pattern = f'durationPercent: {pct}'
                # Replace only in this section
                new_section = new_section.replace(old_pattern, new_pattern)
            
            # Update lines
            new_section_lines = new_section.split('\n')
            lines = lines[:intervals_start] + new_section_lines + lines[intervals_end+1:]
            converted += 1
    
    Path(filepath).write_text('\n'.join(lines))
    return converted

# Convert both files
files = [
    'src/lib/research-workouts.ts',
    'src/lib/research-workouts-v2.ts',
]

for f in files:
    count = convert_file(f)
    print(f'{f}: {count} workouts converted')

PYTHON
