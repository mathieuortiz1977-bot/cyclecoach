#!/usr/bin/env python3

"""
REFACTORING SCRIPT: Convert duplicates to percentage-based system

Process:
1. Identify duplicate workout patterns
2. Keep one "anchor" version
3. Convert to percentage-based duration
4. Remove the "variant" versions
5. Create refactored workout definitions
"""

import re
import json
from pathlib import Path
from collections import defaultdict

class DuplicateAnalyzer:
    def __init__(self):
        self.all_workouts = {}
        self.by_category = defaultdict(list)
        self.duplicates = []
    
    def extract_workouts(self, filepath):
        """Extract workouts from TypeScript file"""
        content = Path(filepath).read_text()
        
        id_pattern = r"id:\s*['\"]([^'\"]+)['\"]"
        cat_pattern = r"category:\s*['\"]([^'\"]+)['\"]"
        dur_pattern = r"duration:\s*(\d+)"
        title_pattern = r"title:\s*['\"]([^'\"]+)['\"]"
        
        blocks = re.split(r'{\s*id:', content)
        
        for block in blocks[1:]:
            full_block = '{id:' + block
            
            id_match = re.search(id_pattern, full_block)
            if not id_match:
                continue
            
            workout_id = id_match.group(1)
            category = re.search(cat_pattern, full_block)
            duration = re.search(dur_pattern, full_block)
            title = re.search(title_pattern, full_block)
            
            power_ranges = re.findall(r'powerLow:\s*(\d+).*?powerHigh:\s*(\d+)', full_block)
            
            if not category:
                continue
            
            cat = category.group(1)
            workout = {
                'id': workout_id,
                'category': cat,
                'duration': int(duration.group(1)) if duration else 0,
                'title': title.group(1) if title else '',
                'power_ranges': power_ranges,
                'interval_count': len(power_ranges),
            }
            
            self.all_workouts[workout_id] = workout
            self.by_category[cat].append(workout_id)
    
    def find_duplicates_in_category(self, cat):
        """Find duplicate patterns within category"""
        workouts = self.by_category[cat]
        duplicates = []
        
        for i, id1 in enumerate(workouts):
            for id2 in workouts[i+1:]:
                w1 = self.all_workouts[id1]
                w2 = self.all_workouts[id2]
                
                # Same number of intervals?
                if w1['interval_count'] != w2['interval_count']:
                    continue
                
                # Power ranges very similar?
                if not w1['power_ranges'] or not w2['power_ranges']:
                    continue
                
                match_count = 0
                for (l1, h1), (l2, h2) in zip(w1['power_ranges'], w2['power_ranges']):
                    l1, h1 = int(l1), int(h1)
                    l2, h2 = int(l2), int(h2)
                    
                    if l1 == l2 and h1 == h2:
                        match_count += 1
                
                match_pct = (match_count / len(w1['power_ranges'])) * 100
                
                # If >80% of intervals match exactly
                if match_pct >= 80:
                    duplicates.append({
                        'category': cat,
                        'anchor_id': id1,
                        'anchor_title': w1['title'],
                        'anchor_duration': w1['duration'],
                        'duplicate_id': id2,
                        'duplicate_title': w2['title'],
                        'duplicate_duration': w2['duration'],
                        'match_pct': match_pct,
                        'interval_count': w1['interval_count'],
                        'power_ranges': w1['power_ranges'],
                    })
        
        return duplicates
    
    def analyze_all(self):
        """Find all duplicates"""
        all_dups = []
        for cat in sorted(self.by_category.keys()):
            all_dups.extend(self.find_duplicates_in_category(cat))
        
        return sorted(all_dups, key=lambda x: (x['category'], x['anchor_id']))
    
    def generate_refactoring_plan(self, duplicates):
        """Generate plan to convert to percentages"""
        plan = {
            'total_duplicates': len(duplicates),
            'workouts_to_remove': [],
            'workouts_to_refactor': [],
            'by_category': defaultdict(list),
        }
        
        seen_anchors = set()
        
        for dup in duplicates:
            anchor = dup['anchor_id']
            duplicate = dup['duplicate_id']
            
            if anchor not in seen_anchors:
                plan['workouts_to_refactor'].append({
                    'id': anchor,
                    'title': dup['anchor_title'],
                    'category': dup['category'],
                    'default_duration': dup['anchor_duration'],
                    'interval_structure': f"{dup['interval_count']} intervals",
                    'reason': 'Convert to percentage-based system for automatic scaling',
                })
                plan['by_category'][dup['category']].append(anchor)
                seen_anchors.add(anchor)
            
            if duplicate not in plan['workouts_to_remove']:
                plan['workouts_to_remove'].append(duplicate)
        
        return plan
    
    def report(self, duplicates, plan):
        """Generate refactoring report"""
        print('═' * 130)
        print('REFACTORING PLAN: Convert to Percentage-Based System')
        print('═' * 130)
        print()
        
        print(f'DUPLICATES FOUND: {len(duplicates)}')
        print(f'WORKOUTS TO REFACTOR: {len(plan["workouts_to_refactor"])}')
        print(f'WORKOUTS TO REMOVE: {len(plan["workouts_to_remove"])}')
        print()
        print(f'RESULT: {197 - len(plan["workouts_to_remove"])} unique workouts\n')
        
        by_cat = defaultdict(list)
        for dup in duplicates:
            by_cat[dup['category']].append(dup)
        
        for cat in sorted(by_cat.keys()):
            dups = by_cat[cat]
            anchors = set(d['anchor_id'] for d in dups)
            
            print(f'\n{cat}:')
            print('─' * 130)
            print(f'  Duplicates: {len(dups)}')
            print(f'  Anchor templates: {len(anchors)}')
            
            for anchor in sorted(anchors):
                anchor_dups = [d for d in dups if d['anchor_id'] == anchor]
                anchor_w = self.all_workouts[anchor]
                
                print(f'\n  ✓ KEEP & REFACTOR: {anchor} ({anchor_w["duration"]}min)')
                print(f"    '{anchor_w['title']}'")
                print(f"    Will convert to percentage-based: {len(anchor_dups) + 1} variations")
                
                for dup in anchor_dups:
                    print(f"      - Remove: {dup['duplicate_id']} ({dup['duplicate_duration']}min) '{dup['duplicate_title']}'")
        
        print('\n' + '═' * 130)
        return plan


def main():
    analyzer = DuplicateAnalyzer()
    
    print('📚 Loading workouts...')
    analyzer.extract_workouts('src/lib/sessions-data-classified.ts')
    analyzer.extract_workouts('src/lib/research-workouts.ts')
    analyzer.extract_workouts('src/lib/research-workouts-v2.ts')
    
    print(f'✓ Total: {len(analyzer.all_workouts)} workouts\n')
    
    print('🔍 Analyzing for refactoring candidates...')
    duplicates = analyzer.analyze_all()
    plan = analyzer.generate_refactoring_plan(duplicates)
    
    analyzer.report(duplicates, plan)
    
    # Save plan
    plan_json = {
        'total_duplicates': plan['total_duplicates'],
        'workouts_to_remove': plan['workouts_to_remove'],
        'workouts_to_refactor': plan['workouts_to_refactor'],
        'result_total': 197 - len(plan['workouts_to_remove']),
    }
    
    Path('refactoring-plan.json').write_text(json.dumps(plan_json, indent=2))
    print(f'\n📄 Plan saved to refactoring-plan.json\n')


if __name__ == '__main__':
    main()
