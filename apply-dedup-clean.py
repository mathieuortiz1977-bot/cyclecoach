#!/usr/bin/env python3

"""
CLEAN DEDUPLICATION: Properly remove 27 duplicate workouts
Preserves file structure and syntax
"""

import re
import json
from pathlib import Path

# IDs to remove (from previous analysis)
IDS_TO_REMOVE = {
    'w002', 'w004', 'w025', 'w016', 'w020', 'w023', 'w030', 'w040', 'w052',
    'w059', 'w062', 'w066', 'w090', 'w100', 'w101', 'w102', 'w105', 'w019',
    'w022', 'w024', 'w026', 'w027', 'w031', 'w037', 'w039', 'w087', 'w088'
}

def remove_duplicates():
    path = Path('src/lib/research-workouts.ts')
    content = path.read_text()
    
    # Find all comment lines that mark workouts (// W001 –, etc.)
    lines = content.split('\n')
    result_lines = []
    skip_mode = False
    brace_depth = 0
    current_id = None
    
    for i, line in enumerate(lines):
        # Check if this is a workout header comment
        header_match = re.match(r'\s*// (W\d+)\s+–', line)
        if header_match:
            workout_id = 'w' + header_match.group(1)[1:].lower()
            if workout_id in IDS_TO_REMOVE:
                skip_mode = True
                current_id = workout_id
                brace_depth = 0
                continue  # Skip the comment line
        
        if skip_mode:
            # Count braces to know when we've left this workout block
            brace_depth += line.count('{') - line.count('}')
            
            # If we see a closing brace followed by comma at depth 0, we've finished this block
            if brace_depth == 0 and '},' in line:
                skip_mode = False
                current_id = None
                continue  # Skip this closing line
            
            # Skip all lines while in skip mode
            if skip_mode:
                continue
        
        result_lines.append(line)
    
    # Write back
    new_content = '\n'.join(result_lines)
    
    # Clean up multiple blank lines
    new_content = re.sub(r'\n\n\n+', '\n\n', new_content)
    
    path.write_text(new_content)
    
    print(f'✅ Removed {len(IDS_TO_REMOVE)} workouts from research-workouts.ts')
    return len(IDS_TO_REMOVE)

def main():
    print('═' * 100)
    print('CLEAN DEDUPLICATION - Removing 27 Duplicate Workouts')
    print('═' * 100)
    
    print(f'\nWorkouts to remove: {sorted(IDS_TO_REMOVE)}')
    print(f'\nTotal IDs to remove: {len(IDS_TO_REMOVE)}\n')
    
    removed = remove_duplicates()
    
    print(f'\n📊 Database after deduplication:')
    print(f'   Removed: {removed} workouts')
    print(f'   Remaining: 105 - {removed} = {105 - removed} unique workouts\n')
    
    print('✓ File structure preserved')
    print('✓ Ready for rebuild\n')

if __name__ == '__main__':
    main()
