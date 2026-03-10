#!/usr/bin/env python3

"""
CONVERT ALL 165 WORKOUTS TO PERCENTAGE-BASED DURATIONS

This script will:
1. Read all workout files
2. For each workout, convert durationSecs to durationPercent
3. Write updated files
4. Validate percentages sum to ~100%
"""

import re
import json
from pathlib import Path
from typing import List, Dict, Tuple

def extract_all_workouts(filepath: str) -> List[Tuple[int, int, str]]:
    """Extract all workout definitions with their line ranges"""
    content = Path(filepath).read_text()
    lines = content.split('\n')
    
    workouts = []
    brace_depth = 0
    workout_start = -1
    
    for i, line in enumerate(lines):
        # Track braces to find workout boundaries
        brace_depth += line.count('{') - line.count('}')
        
        # Start of workout (has id: )
        if "id: '" in line or 'id: "' in line:
            workout_start = i
        
        # End of workout (closing brace followed by comma or bracket)
        if workout_start != -1 and '},' in line and brace_depth == 1:
            workouts.append((workout_start, i, filepath))
            workout_start = -1
    
    return workouts

def get_workout_def(filepath: str, start_line: int, end_line: int) -> str:
    """Get the full workout definition"""
    lines = Path(filepath).read_text().split('\n')
    return '\n'.join(lines[start_line:end_line + 1])

def extract_durations_from_def(workout_def: str) -> List[Dict]:
    """Extract all durationSecs from a workout definition"""
    durations = []
    
    # Find each interval definition
    interval_pattern = r'\{\s*name:\s*[\'"]([^\'"]+)[\'"].*?durationSecs:\s*(\d+)'
    
    for match in re.finditer(interval_pattern, workout_def, re.DOTALL):
        name = match.group(1)
        duration = int(match.group(2))
        durations.append({
            'name': name,
            'duration_secs': duration,
            'match_text': match.group(0),
            'match_span': match.span()
        })
    
    return durations

def convert_to_percentages(durations: List[Dict]) -> Tuple[List[Dict], int, int]:
    """Convert durations to percentages"""
    if not durations:
        return [], 0, 0
    
    total_secs = sum(d['duration_secs'] for d in durations)
    
    percent_durations = []
    for d in durations:
        pct = (d['duration_secs'] / total_secs) * 100
        pct_rounded = round(pct)
        percent_durations.append({
            **d,
            'percent': pct,
            'percent_rounded': pct_rounded
        })
    
    percent_sum = sum(d['percent_rounded'] for d in percent_durations)
    
    return percent_durations, total_secs, percent_sum

def replace_durations_in_def(workout_def: str, original_durations: List[Dict], percent_durations: List[Dict]) -> str:
    """Replace durationSecs with durationPercent in workout definition"""
    result = workout_def
    
    # Process in reverse order so we don't mess up positions
    for orig, perc in zip(reversed(original_durations), reversed(percent_durations)):
        # Find and replace this specific durationSecs value
        pattern = f"durationSecs:\\s*{orig['duration_secs']}"
        replacement = f"durationPercent: {perc['percent_rounded']}"
        
        # Find the occurrence in the right position
        # This is tricky - we need to be careful about multiple workouts with same duration
        # Use the name as context
        name_context = f"name:\\s*['\"]({orig['name']})['\"]"
        
        # Find all matches of this pattern
        matches = list(re.finditer(name_context, result, re.DOTALL))
        if matches:
            # Get the last match's position
            last_match = matches[-1]
            # Find durationSecs after this name match
            search_start = last_match.end()
            duration_pattern = f"durationSecs:\\s*{orig['duration_secs']}"
            duration_match = re.search(duration_pattern, result[search_start:])
            
            if duration_match:
                pos = search_start + duration_match.start()
                # Replace just this one
                result = (result[:pos] + 
                         re.sub(duration_pattern, replacement, result[pos:pos+100], count=1) +
                         result[pos+100:])
    
    return result

def process_file(filepath: str) -> Tuple[str, int, int, int]:
    """Process entire file and convert all workouts"""
    content = Path(filepath).read_text()
    lines = content.split('\n')
    
    workouts = extract_all_workouts(filepath)
    
    print(f'\nProcessing {filepath}...')
    print(f'Found {len(workouts)} workouts\n')
    
    converted = 0
    errors = 0
    
    # Process workouts from bottom to top to avoid position shifts
    for start_line, end_line, _ in reversed(workouts):
        workout_def = get_workout_def(filepath, start_line, end_line)
        
        # Extract durations
        original_durs = extract_durations_from_def(workout_def)
        
        if not original_durs:
            errors += 1
            continue
        
        # Convert to percentages
        percent_durs, total_secs, percent_sum = convert_to_percentages(original_durs)
        
        # Check if percentages are valid
        if percent_sum < 95 or percent_sum > 105:
            print(f'⚠️  Lines {start_line}-{end_line}: Percent sum = {percent_sum}% (expected ~100%)')
        
        # Replace in lines
        old_lines = lines[start_line:end_line + 1]
        new_def = replace_durations_in_def(workout_def, original_durs, percent_durs)
        new_lines = new_def.split('\n')
        
        # Replace in main lines array
        lines = lines[:start_line] + new_lines + lines[end_line + 1:]
        converted += 1
    
    # Write back
    Path(filepath).write_text('\n'.join(lines))
    
    return filepath, converted, errors, len(workouts)

def main():
    files = [
        'src/lib/research-workouts.ts',
        'src/lib/research-workouts-v2.ts',
    ]
    
    print('═' * 100)
    print('CONVERTING ALL 165 WORKOUTS TO PERCENTAGE-BASED DURATIONS')
    print('═' * 100)
    
    total_converted = 0
    total_errors = 0
    
    for filepath in files:
        if not Path(filepath).exists():
            print(f'✗ {filepath} not found')
            continue
        
        try:
            fpath, converted, errors, total = process_file(filepath)
            print(f'✓ {fpath}: {converted}/{total} converted, {errors} errors')
            total_converted += converted
            total_errors += errors
        except Exception as e:
            print(f'✗ {filepath}: {str(e)}')
            total_errors += 1
    
    print('\n' + '=' * 100)
    print(f'TOTAL CONVERTED: {total_converted} workouts')
    print(f'ERRORS: {total_errors}')
    print('=' * 100)
    print('\nNote: classified.ts uses helper functions - requires manual review')

if __name__ == '__main__':
    main()
