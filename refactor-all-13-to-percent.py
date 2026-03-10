#!/usr/bin/env python3

"""
REFACTOR 13 ANCHOR TEMPLATES TO PERCENTAGE-BASED DURATIONS

This script:
1. Reads each template from research-workouts.ts
2. Extracts all durationSecs intervals
3. Calculates the total time
4. Converts each to a percentage
5. Outputs a template for manual review/update
"""

import re
from pathlib import Path

ANCHORS = ['w005', 'w009', 'w013', 'w015', 'w021', 'w033', 'w034', 'w049', 'w056', 'w071', 'w072', 'w118', 'w124a']

def find_workout(filepath, id_):
    """Find a workout definition by ID"""
    content = Path(filepath).read_text()
    
    # Find the line with this ID
    id_pattern = f"id: '{id_}'"
    if id_pattern not in content:
        return None
    
    # Find the opening brace before the ID
    pos = content.find(id_pattern)
    brace_start = content.rfind('{', 0, pos)
    
    if brace_start == -1:
        return None
    
    # Find the closing brace
    brace_count = 0
    brace_end = brace_start
    for i in range(brace_start, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                brace_end = i
                break
    
    return content[brace_start:brace_end + 1]

def parse_intervals(workout_def):
    """Extract all intervals with their durations"""
    # Find the intervals array
    intervals_match = re.search(r'intervals:\s*\(\)\s*=>\s*\[(.*?)\](?=\s*[,}])', workout_def, re.DOTALL)
    if not intervals_match:
        return []
    
    intervals_str = intervals_match.group(1)
    
    # Extract each interval's durationSecs
    durations = []
    interval_pattern = r'\{\s*name:\s*[\'"]([^\'"]+)[\'"].*?durationSecs:\s*(\d+)'
    
    for match in re.finditer(interval_pattern, intervals_str, re.DOTALL):
        name = match.group(1)
        duration = int(match.group(2))
        durations.append({'name': name, 'duration': duration})
    
    return durations

def analyze_template(id_, workout_def):
    """Analyze a template and calculate percentages"""
    intervals = parse_intervals(workout_def)
    
    if not intervals:
        return None
    
    total_secs = sum(i['duration'] for i in intervals)
    total_mins = total_secs / 60
    
    # Calculate percentages
    percent_intervals = []
    for interval in intervals:
        pct = (interval['duration'] / total_secs) * 100
        pct_rounded = round(pct)
        percent_intervals.append({
            'name': interval['name'],
            'duration_secs': interval['duration'],
            'duration_mins': interval['duration'] / 60,
            'percent': pct,
            'percent_rounded': pct_rounded,
        })
    
    return {
        'id': id_,
        'total_secs': total_secs,
        'total_mins': total_mins,
        'intervals': percent_intervals,
        'percent_sum': sum(i['percent_rounded'] for i in percent_intervals),
    }

def main():
    research_file = 'src/lib/research-workouts.ts'
    
    print('═' * 100)
    print('REFACTORING ANALYSIS: 13 Anchor Templates to Percentage-Based')
    print('═' * 100)
    print()
    
    for anchor_id in ANCHORS:
        workout_def = find_workout(research_file, anchor_id)
        
        if not workout_def:
            print(f'✗ {anchor_id} - NOT FOUND')
            continue
        
        analysis = analyze_template(anchor_id, workout_def)
        
        if not analysis:
            print(f'⚠ {anchor_id} - COULD NOT PARSE')
            continue
        
        print(f'\n{'='*100}')
        print(f'ID: {anchor_id} | Duration: {analysis["total_mins"]:.1f} min')
        print(f'{'='*100}')
        
        for i, interval in enumerate(analysis['intervals'], 1):
            pct = interval['percent_rounded']
            mins = interval['duration_mins']
            name = interval['name']
            print(f'  {i:2d}. {name:20} | {pct:3d}% | {mins:5.1f} min | {interval["duration_secs"]:4d}s')
        
        print(f'\nPercent sum: {analysis["percent_sum"]}% {"✓" if analysis["percent_sum"] >= 98 and analysis["percent_sum"] <= 102 else "⚠"}')
        
        # Print conversion template
        print(f'\nRefactored intervals array:')
        print(f'intervals: () => [')
        for interval in analysis['intervals']:
            pct = interval['percent_rounded']
            print(f'  {{ name: \'{interval["name"]}\', durationPercent: {pct}, ... }},')
        print(f']')

if __name__ == '__main__':
    main()
