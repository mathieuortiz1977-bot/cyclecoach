"""
Comprehensive code audit: duplications, bugs, type issues
"""

import re
from pathlib import Path

# Read periodization.ts
perf_ts = Path('src/lib/periodization.ts').read_text()

print("=" * 80)
print("ROUND 2 COMPREHENSIVE AUDIT")
print("=" * 80)

# Find all function definitions
functions = re.findall(r'function (\w+)\(', perf_ts)
print(f"\n📊 FUNCTIONS FOUND: {len(set(functions))}")
print(f"   Total occurrences: {len(functions)}")
if len(functions) != len(set(functions)):
    from collections import Counter
    dupes = [f for f, count in Counter(functions).items() if count > 1]
    print(f"   ⚠️  DUPLICATED FUNCTION DEFS: {dupes}")

# Find code patterns that are repeated
print("\n🔍 CODE DUPLICATION PATTERNS:")

# Pattern 1: candidates filtering appears multiple times
pattern_candidates_filter = len(re.findall(r'candidates\.filter\(', perf_ts))
print(f"   - 'candidates.filter()' appears {pattern_candidates_filter}x (potential duplication)")

# Pattern 2: durationSecs/durationPercent handling
pattern_duration = len(re.findall(r'durationSecs|durationPercent', perf_ts))
print(f"   - Duration handling appears {pattern_duration}x")

# Pattern 3: MASTER_WORKOUTS references
pattern_master = len(re.findall(r'MASTER_WORKOUTS', perf_ts))
print(f"   - MASTER_WORKOUTS ref appears {pattern_master}x")

# Find hardcoded magic numbers
print("\n🔢 HARDCODED MAGIC NUMBERS (potential bugs):")
magic_numbers = re.findall(r'[^a-zA-Z_]([0-9]{2,})[^a-zA-Z_]', perf_ts)
from collections import Counter
freq = Counter(magic_numbers)
for num, count in freq.most_common(10):
    if count > 2:
        print(f"   - {num} appears {count}x")

# Find missing null checks
print("\n⚠️  POTENTIAL NULL/UNDEFINED ISSUES:")

# Check for .intervals access without null check
interval_accesses = re.findall(r'\.intervals[\.\[\(]', perf_ts)
print(f"   - .intervals accessed {len(interval_accesses)}x (need null checks)")

# Check for MASTER_WORKOUTS[0] fallback (fragile)
fallbacks = re.findall(r'MASTER_WORKOUTS\[0\]||| MASTER_WORKOUTS', perf_ts)
print(f"   - Fallback to MASTER_WORKOUTS[0]: {len(fallbacks)}x (risky if empty)")

# Find potential infinite loops / recursion
print("\n🔄 RECURSION/LOOP RISKS:")
recursion = len(re.findall(r'function \w+.*\{.*\1\(', perf_ts))
print(f"   - Potential recursion: {recursion} (check manually)")

# String concatenation in loops (performance)
print("\n⚡ PERFORMANCE ISSUES:")
string_concat_loops = len(re.findall(r'for.*{.*\+=.*["\']', perf_ts))
print(f"   - String concatenation in loops: {string_concat_loops}x")

# Check for console.log left in production code
console_logs = len(re.findall(r'console\.(log|warn|error)', perf_ts))
print(f"   - Console statements: {console_logs}x (should be removed for prod)")

# Find missing return statements
print("\n↩️  POTENTIAL MISSING RETURNS:")
no_return = len(re.findall(r'if\s*\([^)]+\)\s*\{[^}]*\}\s*(?!return|else)', perf_ts)[:5])
print(f"   - Check {no_return} if-blocks for missing returns")

# Check for undefined variables passed to functions
print("\n❌ UNDEFINED/UNINITIALIZED VARIABLES:")
# Look for parameters used without null check
params_used_unsafe = re.findall(r'(?<![?])\.(map|filter|length|forEach)', perf_ts)
print(f"   - Potentially unsafe property accesses: {len(params_used_unsafe)}x")

print("\n" + "=" * 80)
print("AUDIT COMPLETE - SEE DETAILS ABOVE")
print("=" * 80)

