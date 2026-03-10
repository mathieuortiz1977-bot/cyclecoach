#!/usr/bin/env python3

"""
REFACTOR ALL 165 WORKOUTS TO PERCENTAGE-BASED DURATIONS

Strategy:
1. Parse each workout's intervals
2. Calculate percentages
3. Create mapping of old→new for each workout
4. Use sed/regex to replace durationSecs with durationPercent
"""

import re
import json
from pathlib import Path

def analyze_workout(content: str, start: int, end: int) -> dict:
    """Analyze a single workout in the content"""
    lines = content.split('\n')
    workout_lines = lines[start:end + 1]
    workout_text = '\n'.join(workout_lines)
    
    # Extract id
    id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", workout_text)
    if not id_match:
        return None
    
    workout_id = id_match.group(1)
    
    # Extract all durationSecs and their values
    durations = re.findall(r'durationSecs:\s*(\d+)', workout_text)
    
    if not durations:
        return {
            'id': workout_id,
            'lines': (start, end),
            'total_secs': 0,
            'intervals': [],
            'valid': False
        }
    
    duration_ints = [int(d) for d in durations]
    total = sum(duration_ints)
    
    # Calculate percentages
    intervals = []
    for d in duration_ints:
        pct = round((d / total) * 100) if total > 0 else 0
        intervals.append({
            'secs': d,
            'percent': pct
        })
    
    percent_sum = sum(i['percent'] for i in intervals)
    valid = percent_sum >= 95 and percent_sum <= 105
    
    return {
        'id': workout_id,
        'lines': (start, end),
        'total_secs': total,
        'total_mins': total / 60,
        'intervals': intervals,
        'percent_sum': percent_sum,
        'valid': valid,
        'duration_count': len(durations)
    }

def process_file(filepath: str) -> dict:
    """Analyze all workouts in a file"""
    content = Path(filepath).read_text()
    lines = content.split('\n')
    
    workouts = []
    brace_depth = 0
    start_idx = -1
    
    # Find all workout blocks
    for i, line in enumerate(lines):
        brace_depth += line.count('{') - line.count('}')
        
        if 'id:' in line and ('"' in line or "'" in line):
            start_idx = i
        
        if start_idx != -1 and '},' in line and brace_depth <= 1:
            analysis = analyze_workout(content, start_idx, i)
            if analysis:
                workouts.append(analysis)
            start_idx = -1
    
    return {
        'filepath': filepath,
        'workouts': workouts,
        'total': len(workouts),
        'valid': len([w for w in workouts if w['valid']]),
    }

def main():
    files = [
        'src/lib/research-workouts.ts',
        'src/lib/research-workouts-v2.ts',
    ]
    
    print('═' * 110)
    print('ANALYSIS: CONVERTING ALL WORKOUTS TO PERCENTAGE-BASED')
    print('═' * 110)
    print()
    
    total_workouts = 0
    total_valid = 0
    invalid_workouts = []
    
    for filepath in files:
        if not Path(filepath).exists():
            print(f'✗ {filepath} not found')
            continue
        
        analysis = process_file(filepath)
        
        print(f'\n{filepath}:')
        print(f'  Total workouts: {analysis["total"]}')
        print(f'  Valid intervals: {analysis["valid"]}')
        
        # Show any problematic ones
        problems = [w for w in analysis['workouts'] if not w['valid']]
        if problems:
            print(f'  ⚠️  Problematic: {len(problems)}')
            for w in problems[:5]:
                print(f'      - {w["id"]}: {w["percent_sum"]}% (expected ~100%)')
        
        # Show sample breakdown for first 3 workouts
        print(f'\n  Sample conversions:')
        for w in analysis['workouts'][:3]:
            if not w['intervals']:
                continue
            print(f'    {w["id"]} ({w["total_mins"]:.1f} min, {w["duration_count"]} intervals):')
            for i, interval in enumerate(w['intervals'][:3]):
                print(f'      - {interval["secs"]:4d}s → {interval["percent"]:3d}%')
            if len(w['intervals']) > 3:
                print(f'      ... {len(w["intervals"]) - 3} more')
        
        total_workouts += analysis['total']
        total_valid += analysis['valid']
        invalid_workouts.extend([w['id'] for w in problems])
    
    print('\n' + '═' * 110)
    print(f'SUMMARY:')
    print(f'  Total workouts: {total_workouts}')
    print(f'  Valid for conversion: {total_valid}')
    print(f'  Problematic: {len(invalid_workouts)}')
    print('═' * 110)
    print()
    
    if invalid_workouts:
        print('Problematic workouts (may need manual review):')
        for wid in invalid_workouts[:20]:
            print(f'  - {wid}')
    
    print('\nTo proceed with conversion, run:')
    print('  bash refactor-all-workouts.sh')

if __name__ == '__main__':
    main()
