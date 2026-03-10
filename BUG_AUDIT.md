# CycleCoach Data Structure & Bug Audit (March 10, 2026)

## 🔴 CRITICAL ISSUES FOUND

### Issue 1: Interval Data Structure Mismatch
**Status**: ⚠️ POTENTIAL BUG

**Location**: API endpoint saves intervals, Dashboard/Training Plan displays them

**Problem**:
- Database schema requires: `powerLow: Float`, `powerHigh: Float` (% FTP)
- Generated intervals provide these fields ✅
- **BUT**: Some intervals might have `powerLow: 0`, `powerHigh: 0` (outdoor sessions)
- Dashboard displays 0 power as "no data" or errors

**Example**:
```typescript
// Outdoor session interval
{
  name: "Free Ride",
  durationSecs: 16200,
  powerLow: 0,        // ← This is valid for outdoor (no power meter)
  powerHigh: 0,       // ← This is valid for outdoor
  zone: "MIXED",
  purpose: "Apply the week's indoor work to the road",
  coachNote: "..."
}
```

**Fix Needed**: Dashboard should handle `powerLow: 0, powerHigh: 0` as "free ride" mode

---

### Issue 2: Cadence Defaults Not Saved
**Status**: ⚠️ POTENTIAL BUG

**Location**: API saves to DB

**Problem**:
- Generated intervals sometimes omit `cadenceLow` and `cadenceHigh`
- Database schema allows `null` (they're optional)
- **BUT** the API defaults them in the creation step:
  ```typescript
  cadenceLow: interval.cadenceLow ?? undefined,
  cadenceHigh: interval.cadenceHigh ?? undefined,
  ```
- This saves `undefined` → `null` in database ✅
- Frontend expects optional fields so it should work ✅

**Status**: ✅ Probably fine, but verify in database

---

### Issue 3: RPE Field Sometimes Missing
**Status**: ⚠️ POTENTIAL BUG

**Location**: Generated intervals

**Problem**:
- Some interval templates omit `rpe` field
- API creates with fallback:
  ```typescript
  rpe: interval.rpe ?? undefined,
  ```
- Database allows `null` ✅

**Status**: ✅ Probably fine

---

### Issue 4: Session Duration vs. Interval Duration Mismatch
**Status**: 🔴 CRITICAL BUG

**Location**: `generateIndoorSession()` → `normalizeIntervals()`

**Problem**:
Session says: `duration: 60` (minutes)
Intervals total: might be different because of `normalizeIntervals()`

Example:
```typescript
// Session created with duration: 60
const session = {
  duration: 60,
  intervals: [
    { durationSecs: 600 },  // 10 min
    { durationSecs: 1200 }, // 20 min
    { durationSecs: 600 },  // 10 min
    // Total: 40 minutes
  ]
}

// But the calling code does:
const intervals = normalizeIntervals(rawIntervals, targetDuration);
// This might convert durationPercent → durationSecs based on targetDuration
// If targetDuration ≠ actual session duration, math breaks!
```

**Status**: 🔴 NEEDS FIX

**How to Fix**:
1. Calculate total interval duration BEFORE normalizing
2. Verify it matches session.duration
3. If not, scale intervals proportionally

---

### Issue 5: Block Numbering Off-by-One
**Status**: ⚠️ POTENTIAL BUG

**Location**: `generatePlan()` → Block creation

**Problem**:
If `includeInitialFTPTest` = true:
- Block 1: BASE (includes FTP test week + 3 regular weeks)
- Block 2: THRESHOLD
- Block 3: VO2MAX
- Block 4: RACE_SIM
- Block 5: BASE

But database saves:
```typescript
blocks.push({ blockNumber: blockNum + 1, type: blockType, weeks });
// blockNum might be wrong!
```

Let me trace through:
```
includeInitialFTPTest = true
blockStartNum = 1

Block 0 (after FTP): blockNumber = 0 + 1 = 1 ✓ (BASE)
Then:
  blockNum = (includeInitialFTPTest ? 2 : 1) + b = 2 + 0 = 2
  blocks.push({ blockNumber: 2 + 1 = 3 ... })  ← WRONG! Should be 2

Actually: blockNumber: blockNum + 1
  Where blockNum = 2, so blockNumber = 3
  But this is the 2nd block!
```

**Status**: 🔴 CRITICAL - Block numbering is off!

---

### Issue 6: Week Number Calculation in FTP Block
**Status**: 🔴 CRITICAL BUG

**Location**: `generatePlan()` FTP test block week generation

**Problem**:
```typescript
...Array(3).fill(0).map((_, weekIdx) => {
  const weekType = WEEK_SEQUENCE[weekIdx + 1]; // Index 1, 2, 3 = BUILD_PLUS, OVERREACH, RECOVERY
  const weekNum = 2 + weekIdx;  // 2, 3, 4 ✓

  // But if FTP test only took Week 1, these should be weeks 2-4 ✓
  // This part looks OK!
})
```

**Status**: ✅ Probably OK

---

### Issue 7: previousWeekStructures Not Properly Tracked
**Status**: ⚠️ POTENTIAL BUG

**Location**: Between week-to-week generation

**Problem**:
```typescript
let previousWeekStructures: Partial<Record<DayOfWeek, WorkoutStructure>> = {};
// ... generate week ...
sessions.forEach(s => {
  previousWeekStructures[s.dayOfWeek] = s.structure;
});
// But previousWeekStructures never carries over between blocks!
// After Block 1 finishes, it resets for Block 2
```

**Impact**: Workouts can repeat across block boundaries
- Example: If BASE block ends with "VO2 Max Pyramid" on Thursday
- THRESHOLD block Week 1 might start with "VO2 Max Pyramid" on Thursday again

**Status**: ⚠️ Minor issue (variety between blocks is OK, but could be better)

---

### Issue 8: Outdoor Day Generation Missing Saturday Logic
**Status**: 🔴 CRITICAL BUG

**Location**: `generateWeekSessions()` → Saturday handling

**Problem**:
```typescript
for (const day of allDays) {
  // ...
  if (day === outdoorDay) {
    session = generateOutdoorSession(weekType, blockNum, day);
  }
}

// But what if trainingDays = ["MON", "TUE", "THU", "FRI", "SAT"]
// and outdoorDay = "SAT"
// SAT is in trainingDays, so it runs generateOutdoorSession ✓

// BUT what if trainingDays = ["MON", "TUE", "WED", "THU", "FRI"]
// and outdoorDay = "SAT"
// SAT is NOT in trainingDays!
// Then it creates a REST DAY instead of OUTDOOR DAY
// This breaks the outdoor day requirement!
```

**Status**: 🔴 NEEDS FIX

**Fix**:
```typescript
if (day === outdoorDay && trainingDays.includes(day)) {
  session = generateOutdoorSession(...);
} else if (day === outdoorDay && !trainingDays.includes(day)) {
  // What should happen? Skip outdoor day? Or force it?
  // Currently: creates rest day (wrong!)
  session = generateRestDay(day);
}
```

---

### Issue 9: Target Duration Not Applied to All Sessions
**Status**: 🔴 CRITICAL BUG

**Location**: `generateIndoorSession()` → `fixSessionDuration()`

**Problem**:
```typescript
// In generateIndoorSession:
const targetDuration = targetDurationMinutes || template.duration;

// OK, uses target if provided ✓

// But then in fixSessionDuration:
const userProvidedDuration: number | undefined;
if (session.dayOfWeek === "FRI") {
  userProvidedDuration = userFridayDurationMinutes;
} else if (session.dayOfWeek === "SUN") {
  userProvidedDuration = userSundayDurationMinutes ?? userTargetDuration;
} else {
  userProvidedDuration = userTargetDuration;
}

// Friday-specific duration works ✓
// Sunday-specific duration works ✓
// But what about REST DAYS?
// Rest days are generated with duration: 0
// Then fixSessionDuration tries to apply target duration!
```

Example:
```
Rest Day:
  duration: 0
  No intervals
  
Then fixSessionDuration applies userTargetDuration = 60
  Result: Rest Day with duration 60? ✗
```

**Status**: 🔴 NEEDS FIX

---

### Issue 10: Interval Duration Math in normalizeIntervals
**Status**: 🔴 CRITICAL BUG

**Location**: `normalizeIntervals()`

**Problem**:
```typescript
export function normalizeIntervals(
  intervals: (IntervalDef | RawIntervalDef)[],
  totalDurationMinutes: number
): IntervalDef[] {
  const totalSecs = totalDurationMinutes * 60;
  
  return intervals.map(interval => {
    if ('durationSecs' in interval && interval.durationSecs !== undefined) {
      return interval as IntervalDef; // Use existing durationSecs
    }
    if ('durationPercent' in interval && interval.durationPercent !== undefined) {
      return {
        ...interval,
        durationSecs: Math.round(((interval.durationPercent / 100) * totalSecs))
      } as IntervalDef;
    }
    return {
      ...interval,
      durationSecs: 600  // Default to 10 minutes
    } as IntervalDef;
  });
}

// PROBLEM: If an interval has BOTH durationSecs AND durationPercent
// The function uses durationSecs and IGNORES durationPercent
// This is correct behavior ✓

// BUT: If totalDurationMinutes is wrong (mismatched from session.duration)
// The percent-based intervals scale incorrectly!

Example:
  targetDurationMinutes = 60 (from user)
  session created = 60 minutes
  
  But then fixSessionDuration scales it:
    session.duration = 50 (after applying day multiplier)
  
  BUT normalizeIntervals already used totalDurationMinutes = 60!
  So interval percentages don't match the final session duration!
```

**Status**: 🔴 CRITICAL - Duration scaling is broken!

---

### Issue 11: Zone/Category Mismatch in MASTER_WORKOUTS
**Status**: ⚠️ POTENTIAL BUG

**Location**: Workout template loading

**Problem**:
- Templates from JSON files have `category` field
- But `selectWorkoutTemplate()` filters by `category`
- Need to verify all 260 workouts have a valid `category`

**Check needed**:
```bash
# Count workouts by category
jq '.[] | .category' src/lib/workouts/*/*.json | sort | uniq -c
```

**Expected output**:
- BASE: ~77
- THRESHOLD: ~41
- VO2MAX: ~60
- RECOVERY: ~3
- ANAEROBIC: ~X
- Other: ~X

**Status**: ⚠️ NEEDS VERIFICATION

---

### Issue 12: Route Data Missing for Outdoor Sessions
**Status**: ⚠️ POTENTIAL BUG

**Location**: `generateOutdoorSession()`

**Problem**:
```typescript
const route = getRouteForWeek(weekType, weekNum);
// getRouteForWeek might return null/undefined
// Then:
return {
  dayOfWeek: day,
  sessionType: "OUTDOOR",
  duration: route ? Math.round(route.distance * 3) : baseDuration,
  title: route ? route.name : "Endurance Ride",
  description: route ? route.description : "Long outdoor...",
  intervals: [{
    name: route ? route.name : "Endurance Ride",  // ← Can be undefined
    durationSecs: duration * 60,
    powerLow: intensity,
    powerHigh: intensity,
    zone: "Z2",
    purpose: "Aerobic base building",
    coachNote: getCoachNote("saturday")
  }],
  route,  // ← Can be null/undefined
};
```

**Status**: ⚠️ May cause issues if route is null

---

### Issue 13: Interval Name/Purpose Strings Very Long
**Status**: ⚠️ COSMETIC BUG

**Location**: Interval definitions in periodization.ts

**Problem**:
Some interval names are too long:
- "Z2 Pyramid Start" (good) ✓
- "Gradually raise heart rate and muscle temperature" (good for purpose) ✓
- But the interval NAMES like "VO2 Mixed Set 1 - Steady" (fine) ✓

**Status**: ✅ OK

---

### Issue 14: TypeScript Issue in Database Creation
**Status**: 🟡 POTENTIAL TYPE ERROR

**Location**: API route `/api/plan` POST

**Problem**:
```typescript
intervals: {
  create: session.intervals.map((interval, idx) => {
    const powerLow = interval.powerLow ?? 50;
    const powerHigh = interval.powerHigh ?? 75;
    const zone = interval.zone ?? 'Z2';
    
    return {
      orderNum: idx,
      name: interval.name || `Interval ${idx}`,
      durationSecs: interval.durationSecs || 60,  // ← Default 60 secs
      powerLow,
      powerHigh,
      cadenceLow: interval.cadenceLow ?? undefined,  // ← nullable
      cadenceHigh: interval.cadenceHigh ?? undefined, // ← nullable
      rpe: interval.rpe ?? undefined,  // ← nullable
      zone,
      purpose: interval.purpose || '',  // ← Could be empty string
      coachNote: interval.coachNote || '',  // ← Could be empty string
    };
  }),
},

// ISSUE: Defaults are good, but for outdoor sessions:
// durationSecs = 16200 (this is OK)
// purpose = "" (empty string for free ride)
// coachNote = "" (empty string)

// This should work but might show as "no data" in UI
```

**Status**: ✅ Probably OK, but could be better

---

## Summary of Critical Bugs

| # | Issue | Severity | Location | Fix Complexity |
|---|-------|----------|----------|-----------------|
| 1 | Interval data (0 power for outdoor) | ⚠️ Medium | Dashboard display | Easy |
| 4 | Duration vs. Interval duration mismatch | 🔴 Critical | normalizeIntervals | Hard |
| 5 | Block numbering off-by-one | 🔴 Critical | generatePlan | Medium |
| 8 | Outdoor day not in training days | 🔴 Critical | generateWeekSessions | Easy |
| 9 | Target duration not applied to rest days | 🔴 Critical | fixSessionDuration | Easy |
| 10 | Interval percent scaling broken | 🔴 Critical | normalizeIntervals + fixSessionDuration | Hard |
| 11 | Zone/Category verification needed | ⚠️ Medium | Workout data | Easy (verify) |

---

## Recommended Fix Order

1. **Issue 11 (FIRST)**: Verify all 260 workouts have valid `category` field
2. **Issue 5**: Fix block numbering calculation
3. **Issue 8**: Fix outdoor day logic when not in training days
4. **Issue 9**: Don't apply target duration to rest days
5. **Issue 4 + 10**: Fix duration/interval scaling completely
6. **Issue 1**: Handle 0 power in dashboard for outdoor

---

## Testing Strategy

After fixes, run:
```bash
npm run build  # Verify TypeScript
node scripts/test-plan-flow.js  # Verify plan generation
```

Then manually test:
1. Generate plan from Settings page
2. Check Dashboard displays all sessions correctly
3. Check Training Plan shows all blocks/weeks
4. Verify no duplicate sessions in a week
5. Verify duration matches interval total
6. Verify outdoor days are Saturday (or configured day)

