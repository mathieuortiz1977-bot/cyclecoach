"""
Detailed bug check for recent changes
"""

import re
from pathlib import Path

print("=" * 80)
print("DETAILED BUG CHECK - RECENT CHANGES")
print("=" * 80)

# Check 1: Parameter threading consistency
print("\n🔍 CHECK 1: Sunday Duration Parameter Threading")
print("-" * 80)

perf_ts = Path('src/lib/periodization.ts').read_text()
route_ts = Path('src/app/api/plan/route.ts').read_text()

# Find generatePlan signature
plan_sig = re.search(r'export function generatePlan\((.*?)\):', perf_ts, re.DOTALL)
if plan_sig:
    params = plan_sig.group(1).split(',')
    print(f"generatePlan() parameters: {len(params)}")
    for i, p in enumerate(params):
        p_clean = p.strip().split('//')[0].strip()
        print(f"  {i+1}. {p_clean[:50]}")

# Find generateWeekSessions signature
week_sig = re.search(r'function generateWeekSessions\((.*?)\):', perf_ts, re.DOTALL)
if week_sig:
    params = week_sig.group(1).split(',')
    print(f"\ngenerateWeekSessions() parameters: {len(params)}")

# Check all call sites
print("\nGenerateWeekSessions call sites:")
calls = re.findall(r'generateWeekSessions\s*\(\s*([^)]+)\s*\)', perf_ts, re.DOTALL)
for i, call in enumerate(calls):
    arg_count = call.count(',') + 1
    has_sunday = 'targetSundayDurationMinutes' in call or 'Sunday' in call
    status = "✅" if has_sunday else "❌"
    print(f"  {status} Call {i+1}: {arg_count} arguments, Sunday param: {has_sunday}")

# Check 2: Null check consistency
print("\n🔍 CHECK 2: Sunday Duration Null Checks")
print("-" * 80)

# Look for Sunday duration handling
sunday_handling = re.findall(r'day === "SUN".*?targetSundayDurationMinutes.*?\n', perf_ts, re.DOTALL)
print(f"Found {len(sunday_handling)} Sunday-specific duration handling blocks")

for match in sunday_handling:
    lines = match.split('\n')[0:3]
    for line in lines:
        if line.strip():
            print(f"  {line[:70]}")

# Check 3: WorkoutCard duration handling
print("\n🔍 CHECK 3: WorkoutCard Duration Calculations")
print("-" * 80)

wc = Path('src/components/WorkoutCard.tsx').read_text()

# Find the reduce function
reduce_pattern = r'intervals\.reduce\s*\((.*?)\n\s*\},\s*0\)'
reduce_blocks = re.findall(reduce_pattern, wc, re.DOTALL)
print(f"Reduce blocks found: {len(reduce_blocks)}")

# Check if DISPLAY_DURATION_MINS is used correctly
display_const = re.search(r'const DISPLAY_DURATION_MINS = (\d+)', wc)
if display_const:
    print(f"✅ DISPLAY_DURATION_MINS = {display_const.group(1)} (hardcoded)")

display_uses = re.findall(r'DISPLAY_DURATION_MINS', wc)
print(f"DISPLAY_DURATION_MINS used: {len(display_uses)}x")

# Check for potential division by zero
div_by_zero = re.findall(r'/ \(totalDurationMins \* 60\)', wc)
if div_by_zero:
    print(f"⚠️  Division by (totalDurationMins * 60) found: {len(div_by_zero)}x")
    print(f"    Risk: If totalDurationMins = 0, division by zero")

# Check 4: Coach.ts tone mode handling
print("\n🔍 CHECK 4: Coach.ts Tone Mode Handling")
print("-" * 80)

coach = Path('src/lib/coach.ts').read_text()

# Check tone type definition
tone_type = re.search(r'type CoachTone = "(.*?)"', coach, re.DOTALL)
if tone_type:
    tones = tone_type.group(1).split('" | "')
    print(f"CoachTone modes: {len(tones)}")
    for tone in tones:
        print(f"  - {tone}")

# Check pools definition
pools = re.findall(r'(\w+):\s*\{', coach)
unique_pools = set(pools)
print(f"\nPools defined in commentary: {len(unique_pools)}")

# Check if all pools have all tones
tones = ["DARK_HUMOR", "MOTIVATIONAL", "TECHNICAL", "MIXED"]
pool_tone_coverage = {}
for pool in unique_pools:
    pattern = rf'{pool}:\s*\{{([^}}]+)\}}'
    match = re.search(pattern, coach, re.DOTALL)
    if match:
        content = match.group(1)
        has_tones = sum(1 for tone in tones if f'"{tone}"' in content or f"'{tone}'" in content)
        pool_tone_coverage[pool] = has_tones

print("\nTone coverage per pool:")
for pool, tone_count in sorted(pool_tone_coverage.items()):
    status = "✅" if tone_count == 4 else "⚠️"
    print(f"  {status} {pool}: {tone_count}/4 tones")

# Check 5: API route parameter validation
print("\n🔍 CHECK 5: API Route Parameter Validation")
print("-" * 80)

route = Path('src/app/api/plan/route.ts').read_text()

# Find body parameter extraction
params_extracted = re.findall(r'const (\w+) = body\.(\w+)', route)
print(f"Parameters extracted from request body: {len(params_extracted)}")
for const_name, body_param in params_extracted:
    print(f"  - body.{body_param} → {const_name}")

# Check if extracted params are validated
validations = re.findall(r'if\s*\(.*?(targetDurationMinutes|targetSundayDurationMinutes)', route)
print(f"\nValidations found: {len(validations)}")
if len(validations) == 0:
    print("  ⚠️  No input validation for duration parameters")

print("\n" + "=" * 80)
print("BUG CHECK COMPLETE")
print("=" * 80)

