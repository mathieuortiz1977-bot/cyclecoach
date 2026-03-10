#!/usr/bin/env python3

"""
Remove 25 duplicate workouts from source files
"""

import re
from pathlib import Path

REMOVE_IDS = [
    "w006", "w010", "w014", "w017", "w018", "w036", "w048", "w051", "w053",
    "w055", "w057", "w058", "w060", "w064", "w065", "w069", "w073", "w075",
    "w081", "w083", "w091", "w098", "w099", "w119", "w124b"
]

def remove_from_classified(filepath):
    """Remove workouts from sessions-data-classified.ts"""
    content = Path(filepath).read_text()
    lines = content.split('\n')
    
    new_lines = []
    skip_until_bracket = False
    removed = []
    
    for i, line in enumerate(lines):
        # Check if this line contains a removal ID
        for wid in REMOVE_IDS:
            if f'id: "{wid}' in line or f"id: '{wid}" in line:
                # Find the end of this workout definition (closing })
                j = i
                brace_count = 0
                while j < len(lines):
                    brace_count += lines[j].count('{') - lines[j].count('}')
                    if brace_count == 0 and j > i:
                        # Found the closing brace
                        removed.append(wid)
                        skip_until_line = j
                        # Skip to after the comma on this line or next line
                        while skip_until_line < len(lines) and '},' not in lines[skip_until_line]:
                            skip_until_line += 1
                        skip_until_line += 1
                        
                        # Skip all lines until next workout or end
                        i = skip_until_line - 1
                        break
                    j += 1
                break
        else:
            # Line doesn't contain a removal ID, keep it
            new_lines.append(line)
    
    return '\n'.join(new_lines), removed

def remove_from_research(filepath):
    """Remove workouts from research-workouts.ts files"""
    content = Path(filepath).read_text()
    
    # Split by workout blocks (by looking for { at start of line or with id:)
    removed = []
    
    for wid in REMOVE_IDS:
        # Find pattern: { ... id: 'wXXX' ... }
        pattern = r'\{[^}]*id:\s*[\'"]' + re.escape(wid) + r'[\'"][^}]*\}(?:\s*,)?'
        
        # More sophisticated: find the opening brace and then closing brace
        # Look for the pattern with id first
        id_pattern = rf"id:\s*['\"]({re.escape(wid)})['\"]\s*,"
        
        match = re.search(id_pattern, content)
        if match:
            # Found the id, now find the opening brace of this object
            # Go backwards from the id position to find {
            start_pos = match.start()
            brace_pos = content.rfind('{', 0, start_pos)
            
            if brace_pos == -1:
                continue
            
            # Now find the closing brace
            brace_count = 0
            end_pos = brace_pos
            for i, char in enumerate(content[brace_pos:], brace_pos):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_pos = i + 1
                        break
            
            # Remove trailing comma if present
            if end_pos < len(content) and content[end_pos] == ',':
                end_pos += 1
            
            # Remove any trailing whitespace/newlines before next item
            while end_pos < len(content) and content[end_pos] in ' \n\r':
                end_pos += 1
            
            # Replace this workout with empty string
            content = content[:brace_pos] + content[end_pos:]
            removed.append(wid)
    
    return content, removed

def main():
    print('🗑️  REMOVING 25 DUPLICATE WORKOUTS\n')
    
    # Remove from classified
    print('Processing sessions-data-classified.ts...')
    try:
        classified_path = 'src/lib/sessions-data-classified.ts'
        content_classified = Path(classified_path).read_text()
        
        removed_classified = []
        for wid in REMOVE_IDS:
            # These are on single lines typically
            pattern = r'\s*\{\s*id:\s*"' + re.escape(wid) + r'[^}]+\},?\s*\n'
            
            new_content, was_found = None, False
            for match in re.finditer(pattern, content_classified):
                new_content = content_classified[:match.start()] + content_classified[match.end():]
                content_classified = new_content
                was_found = True
                removed_classified.append(wid)
                break
        
        if removed_classified:
            Path(classified_path).write_text(content_classified)
            print(f'  ✓ Removed {len(removed_classified)} from classified')
            for wid in removed_classified:
                print(f'    - {wid}')
    except Exception as e:
        print(f'  ✗ Error: {e}')
    
    # Remove from research workouts
    print('\nProcessing research-workouts.ts...')
    try:
        research_path = 'src/lib/research-workouts.ts'
        content_research = Path(research_path).read_text()
        
        removed_research = []
        for wid in REMOVE_IDS:
            id_pattern = rf"id:\s*['\"]({re.escape(wid)})['\"]\s*,"
            match = re.search(id_pattern, content_research)
            
            if match:
                start_pos = match.start()
                # Find opening brace before this id
                brace_pos = content_research.rfind('{', max(0, start_pos - 500), start_pos)
                
                if brace_pos == -1:
                    continue
                
                # Find closing brace
                brace_count = 1
                end_pos = brace_pos + 1
                while end_pos < len(content_research):
                    if content_research[end_pos] == '{':
                        brace_count += 1
                    elif content_research[end_pos] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            break
                    end_pos += 1
                
                # Remove the workout + trailing comma/whitespace
                end_pos += 1  # Include the closing brace
                if end_pos < len(content_research) and content_research[end_pos] == ',':
                    end_pos += 1
                
                # Skip following newlines
                while end_pos < len(content_research) and content_research[end_pos] in '\n\r':
                    end_pos += 1
                
                content_research = content_research[:brace_pos] + content_research[end_pos:]
                removed_research.append(wid)
        
        if removed_research:
            Path(research_path).write_text(content_research)
            print(f'  ✓ Removed {len(removed_research)} from research-workouts.ts')
            for wid in removed_research:
                print(f'    - {wid}')
    except Exception as e:
        print(f'  ✗ Error: {e}')
    
    # Remove from V2
    print('\nProcessing research-workouts-v2.ts...')
    try:
        v2_path = 'src/lib/research-workouts-v2.ts'
        content_v2 = Path(v2_path).read_text()
        
        removed_v2 = []
        for wid in REMOVE_IDS:
            id_pattern = rf"id:\s*['\"]({re.escape(wid)}[^'\"]*?)['\"]\s*,"
            match = re.search(id_pattern, content_v2)
            
            if match:
                start_pos = match.start()
                brace_pos = content_v2.rfind('{', max(0, start_pos - 500), start_pos)
                
                if brace_pos == -1:
                    continue
                
                brace_count = 1
                end_pos = brace_pos + 1
                while end_pos < len(content_v2):
                    if content_v2[end_pos] == '{':
                        brace_count += 1
                    elif content_v2[end_pos] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            break
                    end_pos += 1
                
                end_pos += 1
                if end_pos < len(content_v2) and content_v2[end_pos] == ',':
                    end_pos += 1
                
                while end_pos < len(content_v2) and content_v2[end_pos] in '\n\r':
                    end_pos += 1
                
                content_v2 = content_v2[:brace_pos] + content_v2[end_pos:]
                removed_v2.append(wid)
        
        if removed_v2:
            Path(v2_path).write_text(content_v2)
            print(f'  ✓ Removed {len(removed_v2)} from research-workouts-v2.ts')
            for wid in removed_v2:
                print(f'    - {wid}')
    except Exception as e:
        print(f'  ✗ Error: {e}')
    
    total_removed = len(removed_classified) + len(removed_research) + len(removed_v2)
    print(f'\n✅ Total removed: {total_removed} workouts')
    print(f'   Result: 197 → {197 - total_removed} workouts\n')


if __name__ == '__main__':
    main()
