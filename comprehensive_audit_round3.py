"""
Comprehensive Code Audit Round 3 - Check recent changes for bugs, duplication, type issues
"""

import os
import re
from pathlib import Path
from collections import Counter

print("=" * 80)
print("ROUND 3: COMPREHENSIVE CODE AUDIT - RECENT CHANGES")
print("=" * 80)

# Files to check
files_to_check = [
    'src/lib/periodization.ts',
    'src/lib/coach.ts',
    'src/lib/purpose-library.ts',
    'src/components/WorkoutCard.tsx',
    'src/app/api/plan/route.ts',
]

print("\n📊 SECTION 1: TYPE SAFETY CHECKS")
print("-" * 80)

for file_path in files_to_check:
    if not os.path.exists(file_path):
        continue
    
    content = Path(file_path).read_text()
    
    # Check for 'any' types
    any_count = len(re.findall(r': any\b|as any\b', content))
    if any_count > 0:
        print(f"⚠️  {file_path}: {any_count} 'any' type annotations")
    
    # Check for missing null checks
    null_checks = len(re.findall(r'\?\.|\|\|.*undefined|if\s*\(.*\)', content))
    
    # Check for implicit returns
    implicit_returns = len(re.findall(r'function\s+\w+.*{[^}]*\n\s*}', content))
    
print("\n📊 SECTION 2: CODE DUPLICATION ANALYSIS")
print("-" * 80)

# Check for repeated patterns in periodization.ts
perf_content = Path('src/lib/periodization.ts').read_text()

# Pattern 1: generateWeekSessions calls
gen_week_calls = len(re.findall(r'generateWeekSessions\(', perf_content))
print(f"generateWeekSessions() called: {gen_week_calls}x")
if gen_week_calls > 2:
    print(f"  ⚠️  Multiple calls - check parameter consistency")

# Pattern 2: duration parameter threading
duration_threading = len(re.findall(r'targetDurationMinutes|targetSundayDurationMinutes', perf_content))
print(f"Duration parameters used: {duration_threading}x")

# Pattern 3: day === "SUN" checks
sun_checks = len(re.findall(r'day === "SUN"|SUN"', perf_content))
print(f"Sunday-specific checks: {sun_checks}x")

# Check coach.ts for comment duplication
coach_content = Path('src/lib/coach.ts').read_text()

# Extract all commentary pools
pools = re.findall(r'(\w+):\s*{', coach_content)
pool_counter = Counter(pools)
print(f"\nCoach.ts pools defined: {len(set(pools))}")
for pool, count in pool_counter.most_common(5):
    if count > 1:
        print(f"  - {pool}: {count} occurrences")

print("\n📊 SECTION 3: RECENT CHANGES VALIDATION")
print("-" * 80)

# Check WorkoutCard changes
workout_card_content = Path('src/components/WorkoutCard.tsx').read_text()

# Check for durationPercent handling
duration_percent_handling = len(re.findall(r'durationPercent', workout_card_content))
duration_secs_handling = len(re.findall(r'durationSecs', workout_card_content))
print(f"WorkoutCard durationPercent references: {duration_percent_handling}x")
print(f"WorkoutCard durationSecs references: {duration_secs_handling}x")

if duration_percent_handling > 0 and duration_secs_handling > 0:
    print("  ✅ Both duration types handled")

# Check for DISPLAY_DURATION_MINS usage
display_duration = len(re.findall(r'DISPLAY_DURATION_MINS', workout_card_content))
print(f"DISPLAY_DURATION_MINS usage: {display_duration}x")
if display_duration < 3:
    print(f"  ⚠️  Only {display_duration} uses - check if constant is used everywhere")

# Check for NaN protection
nan_protection = len(re.findall(r'|| 0|Math.round|isNaN', workout_card_content))
print(f"NaN protection checks: {nan_protection}x")

print("\n📊 SECTION 4: MISSING PARAMETER CHECKS")
print("-" * 80)

# Check API route for all parameter handling
route_content = Path('src/app/api/plan/route.ts').read_text()

# Extract all body parameters
params = re.findall(r'body\.(\w+)', route_content)
param_counter = Counter(params)
print(f"Body parameters extracted: {len(set(params))}")
for param, count in param_counter.most_common(10):
    print(f"  - {param}: {count}x")

print("\n📊 SECTION 5: ERROR HANDLING CHECK")
print("-" * 80)

# Check for try-catch blocks
try_catch = len(re.findall(r'try\s*{|catch\s*\(', route_content))
print(f"Try-catch blocks in API route: {try_catch // 2}")

# Check for null guards
null_guards = len(re.findall(r'if\s*\(\s*![\w.]+\s*\)', perf_content))
console_errors = len(re.findall(r'console\.error', perf_content))
print(f"Null guard checks in periodization: {null_guards}x")
print(f"Console error statements: {console_errors}x")

print("\n📊 SECTION 6: CALLBACK TYPE SAFETY")
print("-" * 80)

# Check for typed callbacks
callbacks = re.findall(r'\.map\s*\(\s*\(([^)]+)\)', workout_card_content)
print(f"Map callbacks in WorkoutCard: {len(callbacks)}")
for cb in callbacks[:5]:
    if ':' in cb:
        print(f"  ✅ Typed: {cb}")
    else:
        print(f"  ⚠️  Untyped: {cb}")

print("\n" + "=" * 80)
print("AUDIT COMPLETE")
print("=" * 80)
