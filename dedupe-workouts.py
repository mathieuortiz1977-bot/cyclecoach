#!/usr/bin/env python3

"""
DEDUPLICATION FILTER: Find and remove near-duplicate workouts
Based on interval structure similarity, not title or duration
"""

import re
import json
from difflib import SequenceMatcher
from pathlib import Path

class WorkoutExtractor:
    def __init__(self):
        self.workouts = {}
    
    def extract_from_classified(self):
        """Extract workouts from sessions-data-classified.ts"""
        path = Path('src/lib/sessions-data-classified.ts')
        content = path.read_text()
        
        # Extract workout definitions
        pattern = r'{\s*id:\s*"([^"]+)"[^}]*?title:\s*"([^"]+)"[^}]*?category:\s*"([^"]+)"[^}]*?intervals:\s*\(\)\s*=>\s*\[(.*?)\]'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            workout_id = match.group(1)
            title = match.group(2)
            category = match.group(3)
            intervals_str = match.group(4)
            
            self.workouts[workout_id] = {
                'id': workout_id,
                'title': title,
                'category': category,
                'intervals_raw': intervals_str,
                'source': 'classified'
            }
    
    def extract_from_research(self):
        """Extract workouts from research-workouts.ts"""
        path = Path('src/lib/research-workouts.ts')
        content = path.read_text()
        
        # Split by workout blocks
        blocks = content.split('// W')
        
        for i, block in enumerate(blocks[1:], 1):
            # Extract fields
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
                    'source': 'research'
                }
    
    def normalize_interval_structure(self, intervals_str):
        """Extract key features from interval definition"""
        if not intervals_str:
            return None
        
        # Parse interval counts, power ranges, durations
        features = {
            'interval_count': len(re.findall(r'name:', intervals_str)),
            'power_ranges': re.findall(r'powerLow:\s*(\d+).*?powerHigh:\s*(\d+)', intervals_str),
            'zones': re.findall(r"zone:\s*['\"]([^'\"]+)['\"]", intervals_str),
            'duration_pattern': self._extract_duration_pattern(intervals_str)
        }
        return features
    
    def _extract_duration_pattern(self, intervals_str):
        """Extract duration pattern as normalized sequence"""
        durations = re.findall(r'durationSecs:\s*(\d+)', intervals_str)
        if not durations:
            return None
        
        # Normalize to ratios instead of absolute durations
        durations = [int(d) for d in durations]
        total = sum(durations)
        if total == 0:
            return None
        
        ratios = tuple(round(d / total, 2) for d in durations)
        return ratios
    
    def similarity_score(self, w1_id, w2_id):
        """Calculate similarity between two workouts (0-1)"""
        w1 = self.workouts[w1_id]
        w2 = self.workouts[w2_id]
        
        # Don't compare same category only - that's too loose
        if w1['category'] != w2['category']:
            return 0
        
        # Normalize intervals
        feat1 = self.normalize_interval_structure(w1['intervals_raw'])
        feat2 = self.normalize_interval_structure(w2['intervals_raw'])
        
        if not feat1 or not feat2:
            return 0
        
        scores = []
        
        # Compare interval count (within 1 is similar)
        count_diff = abs(feat1['interval_count'] - feat2['interval_count'])
        scores.append(1.0 if count_diff <= 1 else max(0, 1 - count_diff / 5))
        
        # Compare power ranges
        if feat1['power_ranges'] and feat2['power_ranges']:
            power_score = self._compare_power_ranges(
                feat1['power_ranges'],
                feat2['power_ranges']
            )
            scores.append(power_score)
        
        # Compare duration patterns (this is KEY for detecting duplicates)
        if feat1['duration_pattern'] and feat2['duration_pattern']:
            duration_score = self._compare_duration_patterns(
                feat1['duration_pattern'],
                feat2['duration_pattern']
            )
            scores.append(duration_score)
        
        # Compare zones
        zones1 = set(feat1['zones'])
        zones2 = set(feat2['zones'])
        if zones1 and zones2:
            zone_score = len(zones1 & zones2) / len(zones1 | zones2)
            scores.append(zone_score)
        
        # Average the scores
        return sum(scores) / len(scores) if scores else 0
    
    def _compare_power_ranges(self, ranges1, ranges2):
        """Compare power ranges (list of (low, high) tuples)"""
        if len(ranges1) != len(ranges2):
            return 0.3
        
        diffs = []
        for (l1, h1), (l2, h2) in zip(ranges1, ranges2):
            l1, h1, l2, h2 = int(l1), int(h1), int(l2), int(h2)
            diff = abs(l1 - l2) + abs(h1 - h2)
            diffs.append(diff)
        
        avg_diff = sum(diffs) / len(diffs)
        # If average power difference < 10%, consider it a match
        return max(0, 1 - avg_diff / 50)
    
    def _compare_duration_patterns(self, pattern1, pattern2):
        """Compare normalized duration patterns"""
        if len(pattern1) != len(pattern2):
            return 0.4
        
        # Use sequence matcher for pattern comparison
        matcher = SequenceMatcher(None, pattern1, pattern2)
        return matcher.ratio()
    
    def find_duplicates(self, threshold=0.80):
        """Find potential duplicates with similarity >= threshold"""
        duplicates = []
        checked = set()
        
        workout_ids = list(self.workouts.keys())
        
        for i, id1 in enumerate(workout_ids):
            for id2 in workout_ids[i+1:]:
                pair = tuple(sorted([id1, id2]))
                if pair in checked:
                    continue
                checked.add(pair)
                
                score = self.similarity_score(id1, id2)
                if score >= threshold:
                    duplicates.append({
                        'id1': id1,
                        'id2': id2,
                        'score': round(score, 2),
                        'title1': self.workouts[id1]['title'],
                        'title2': self.workouts[id2]['title'],
                        'category': self.workouts[id1]['category'],
                        'duration1': self._extract_duration(id1),
                        'duration2': self._extract_duration(id2),
                    })
        
        return sorted(duplicates, key=lambda x: x['score'], reverse=True)
    
    def _extract_duration(self, workout_id):
        """Extract duration in minutes from intervals"""
        intervals = self.workouts[workout_id]['intervals_raw']
        durations = re.findall(r'durationSecs:\s*(\d+)', intervals)
        if durations:
            total_secs = sum(int(d) for d in durations)
            return total_secs // 60
        return 0
    
    def report(self, duplicates):
        """Print duplicate report"""
        print('═' * 120)
        print('DEDUPLICATION ANALYSIS')
        print('═' * 120)
        
        print(f'\nTotal workouts: {len(self.workouts)}')
        print(f'Potential duplicates found: {len(duplicates)}\n')
        
        if not duplicates:
            print('✅ No near-duplicates found\n')
            return
        
        print('Grouped by similarity score:\n')
        
        by_score = {}
        for dup in duplicates:
            score = dup['score']
            if score not in by_score:
                by_score[score] = []
            by_score[score].append(dup)
        
        for score in sorted(by_score.keys(), reverse=True):
            dups = by_score[score]
            print(f'Score {score} ({len(dups)} pairs):\n')
            
            for dup in dups[:10]:  # Show top 10 per score
                print(f"  {dup['id1']} ↔ {dup['id2']} (Similarity: {dup['score']})")
                print(f"    '{dup['title1']}' ({dup['duration1']} min)")
                print(f"    '{dup['title2']}' ({dup['duration2']} min)")
                print()
            
            if len(dups) > 10:
                print(f"  ... and {len(dups) - 10} more pairs\n")
        
        print('═' * 120)
        print('RECOMMENDATIONS')
        print('═' * 120)
        print('\nFor duplicates with score >= 0.95:')
        print('  → REMOVE one (keep the one with better title/research attribution)')
        print('\nFor duplicates with score 0.80-0.95:')
        print('  → REVIEW manually (might be intentional variants)')
        print('\nFor duplicates with score < 0.80:')
        print('  → KEEP both (probably different despite title similarity)\n')
        
        # Count by score range
        high = sum(1 for d in duplicates if d['score'] >= 0.95)
        medium = sum(1 for d in duplicates if 0.80 <= d['score'] < 0.95)
        
        print(f'Action items:')
        print(f'  Remove candidates (>= 0.95): {high}')
        print(f'  Review candidates (0.80-0.95): {medium}\n')


def main():
    extractor = WorkoutExtractor()
    
    print('📚 Extracting workouts...')
    extractor.extract_from_classified()
    print(f'  ✓ Classified: {len([w for w in extractor.workouts.values() if w["source"] == "classified"])}')
    
    extractor.extract_from_research()
    print(f'  ✓ Research: {len([w for w in extractor.workouts.values() if w["source"] == "research"])}')
    print(f'  ✓ Total: {len(extractor.workouts)}\n')
    
    print('🔍 Analyzing for duplicates...')
    duplicates = extractor.find_duplicates(threshold=0.80)
    
    print('\n')
    extractor.report(duplicates)
    
    # Write results to JSON
    output = {
        'total_workouts': len(extractor.workouts),
        'duplicates_found': len(duplicates),
        'duplicates': [
            {
                'id1': d['id1'],
                'id2': d['id2'],
                'similarity': d['score'],
                'title1': d['title1'],
                'title2': d['title2'],
                'category': d['category'],
                'recommendation': 'REMOVE' if d['score'] >= 0.95 else 'REVIEW'
            }
            for d in duplicates
        ]
    }
    
    Path('dedupe-results.json').write_text(json.dumps(output, indent=2))
    print(f'📄 Results saved to dedupe-results.json\n')


if __name__ == '__main__':
    main()
