#!/usr/bin/env python3

"""
APPLY DEDUPLICATION: Remove 69 duplicate pairs, keep one from each
Update TypeScript files and validate
"""

import re
import json
from pathlib import Path

class DedupProcessor:
    def __init__(self):
        self.workouts = {}
        self.duplicates_to_remove = set()
    
    def extract_research_workouts(self):
        """Extract all research workouts"""
        path = Path('src/lib/research-workouts.ts')
        content = path.read_text()
        
        # Split by workout blocks
        blocks = content.split('// W')
        
        for i, block in enumerate(blocks[1:], 1):
            id_match = re.search(r"id:\s*'([^']+)'", block)
            title_match = re.search(r"title:\s*'([^']+)'", block)
            cat_match = re.search(r"category:\s*'([^']+)'", block)
            intervals_match = re.search(r'intervals:\s*\(\)\s*=>\s*\[(.*?)\]', block, re.DOTALL)
            
            if id_match and title_match and cat_match:
                workout_id = id_match.group(1)
                title = title_match.group(1)
                category = cat_match.group(1)
                intervals_str = intervals_match.group(1) if intervals_match else ""
                
                self.workouts[workout_id] = {
                    'id': workout_id,
                    'title': title,
                    'category': category,
                    'intervals_raw': intervals_str,
                    'full_block': block
                }
    
    def normalize_structure(self, intervals_str):
        """Extract structural features"""
        if not intervals_str:
            return None
        
        # Count intervals
        interval_count = len(re.findall(r'name:', intervals_str))
        
        # Extract power ranges
        power_ranges = re.findall(r'powerLow:\s*(\d+).*?powerHigh:\s*(\d+)', intervals_str)
        
        # Extract zones
        zones = re.findall(r"zone:\s*['\"]([^'\"]+)['\"]", intervals_str)
        
        # Duration pattern (ratios)
        durations = re.findall(r'durationSecs:\s*(\d+)', intervals_str)
        durations = [int(d) for d in durations]
        total = sum(durations)
        ratios = tuple(round(d / total, 2) for d in durations) if total > 0 else None
        
        return {
            'interval_count': interval_count,
            'power_ranges': power_ranges,
            'zones': zones,
            'duration_ratios': ratios
        }
    
    def similarity_score(self, id1, id2):
        """Calculate similarity (0-1)"""
        w1 = self.workouts[id1]
        w2 = self.workouts[id2]
        
        # Must be same category
        if w1['category'] != w2['category']:
            return 0
        
        feat1 = self.normalize_structure(w1['intervals_raw'])
        feat2 = self.normalize_structure(w2['intervals_raw'])
        
        if not feat1 or not feat2:
            return 0
        
        scores = []
        
        # Interval count
        count_diff = abs(feat1['interval_count'] - feat2['interval_count'])
        scores.append(1.0 if count_diff <= 1 else max(0, 1 - count_diff / 5))
        
        # Power ranges
        if feat1['power_ranges'] and feat2['power_ranges']:
            if len(feat1['power_ranges']) == len(feat2['power_ranges']):
                diffs = []
                for (l1, h1), (l2, h2) in zip(feat1['power_ranges'], feat2['power_ranges']):
                    l1, h1, l2, h2 = int(l1), int(h1), int(l2), int(h2)
                    diffs.append(abs(l1 - l2) + abs(h1 - h2))
                avg_diff = sum(diffs) / len(diffs)
                scores.append(max(0, 1 - avg_diff / 50))
            else:
                scores.append(0.3)
        
        # Duration ratios
        if feat1['duration_ratios'] and feat2['duration_ratios']:
            if len(feat1['duration_ratios']) == len(feat2['duration_ratios']):
                diff = sum(abs(a - b) for a, b in zip(feat1['duration_ratios'], feat2['duration_ratios']))
                scores.append(max(0, 1 - diff / 0.5))
            else:
                scores.append(0.4)
        
        # Zones
        zones1 = set(feat1['zones'])
        zones2 = set(feat2['zones'])
        if zones1 and zones2:
            zone_score = len(zones1 & zones2) / len(zones1 | zones2)
            scores.append(zone_score)
        
        return sum(scores) / len(scores) if scores else 0
    
    def find_duplicates_to_remove(self, threshold=0.95):
        """Find pairs with similarity >= threshold, keep lower ID"""
        pairs_to_remove = []
        checked = set()
        
        for id1 in sorted(self.workouts.keys()):
            for id2 in sorted(self.workouts.keys()):
                if id1 >= id2:
                    continue
                
                pair = tuple(sorted([id1, id2]))
                if pair in checked:
                    continue
                checked.add(pair)
                
                score = self.similarity_score(id1, id2)
                if score >= threshold:
                    # Keep the one with lower/better ID
                    remove_id = id2  # Remove the higher ID
                    
                    pairs_to_remove.append({
                        'keep': id1,
                        'remove': id2,
                        'score': round(score, 2),
                        'title_keep': self.workouts[id1]['title'],
                        'title_remove': self.workouts[id2]['title'],
                        'category': self.workouts[id1]['category']
                    })
                    
                    self.duplicates_to_remove.add(remove_id)
        
        return pairs_to_remove
    
    def apply_removal(self):
        """Remove duplicates from research-workouts.ts"""
        path = Path('src/lib/research-workouts.ts')
        content = path.read_text()
        
        # For each workout to remove, remove its entire block
        for remove_id in sorted(self.duplicates_to_remove):
            # Find the block for this ID
            pattern = f"// W.*?id:\\s*'{remove_id}'[^}}}}]*?}},"
            content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        # Clean up extra blank lines
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        path.write_text(content)
        
        return len(self.duplicates_to_remove)
    
    def report(self, pairs):
        """Print report"""
        print('═' * 120)
        print('DEDUPLICATION RESULTS - OPTION 1 (Remove Duplicates)')
        print('═' * 120)
        
        print(f'\nTotal workouts: {len(self.workouts)}')
        print(f'Duplicates found: {len(pairs)}')
        print(f'Workouts to REMOVE: {len(self.duplicates_to_remove)}')
        print(f'Workouts remaining: {len(self.workouts) - len(self.duplicates_to_remove)}\n')
        
        if pairs:
            print('Removal Plan (keeping first, removing second):\n')
            
            for pair in pairs[:20]:
                print(f"  KEEP: {pair['keep']} - {pair['title_keep']}")
                print(f"  REMOVE: {pair['remove']} - {pair['title_remove']} (Score: {pair['score']})")
                print()
            
            if len(pairs) > 20:
                print(f'  ... and {len(pairs) - 20} more removals\n')
        
        print('═' * 120)
        print('ACTION: Removing duplicates from research-workouts.ts...')
        print('═' * 120)


def main():
    processor = DedupProcessor()
    
    print('📚 Extracting research workouts...')
    processor.extract_research_workouts()
    print(f'✓ Found {len(processor.workouts)} workouts\n')
    
    print('🔍 Finding duplicates (similarity >= 0.95)...')
    pairs = processor.find_duplicates_to_remove(threshold=0.95)
    print(f'✓ Found {len(pairs)} duplicate pairs\n')
    
    processor.report(pairs)
    
    removed = processor.apply_removal()
    print(f'\n✅ Removed {removed} workouts from research-workouts.ts')
    
    # Summary
    remaining = len(processor.workouts) - len(processor.duplicates_to_remove)
    print(f'\n📊 Final database size: {remaining} unique workouts')
    print(f'   Before: {len(processor.workouts)}')
    print(f'   After: {remaining}')
    print(f'   Removed: {len(processor.duplicates_to_remove)}\n')
    
    # Save removal list
    removal_data = {
        'total_before': len(processor.workouts),
        'total_after': remaining,
        'removed_count': len(processor.duplicates_to_remove),
        'removed_ids': sorted(processor.duplicates_to_remove),
        'duplicate_pairs': pairs
    }
    
    Path('dedup-removal-log.json').write_text(json.dumps(removal_data, indent=2))
    print('📄 Removal log saved to dedup-removal-log.json')


if __name__ == '__main__':
    main()
