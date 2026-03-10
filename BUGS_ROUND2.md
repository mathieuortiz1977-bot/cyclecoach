# ROUND 2 COMPREHENSIVE AUDIT - BUGS & CODE QUALITY

## SECTION A: CRITICAL BUGS

### BUG #7: Hardcoded Magic Numbers (Duration Constants)
**Severity:** MEDIUM  
**Files:** periodization.ts (30+ locations)  
**Issue:** Duration values hardcoded throughout (60, 120, 180, 300, 600, 1200, 1800 seconds)
```typescript
// CURRENT (hardcoded)
durationSecs: 600          // 10 minutes - appears 20x
durationSecs: 300          // 5 minutes - appears 18x
durationSecs: 1200         // 20 minutes
durationSecs: 1800         // 30 minutes
durationSecs: 1080         // 18 minutes
```
**Risk:** Hard to maintain, prone to errors, no single source of truth  
**Fix:** Create constants file:
```typescript
const DURATION = {
  WARMUP: 600,       // 10 min
  REST: 300,         // 5 min
  COOLDOWN: 300,     // 5 min
  SHORT_BLOCK: 900,  // 15 min
  MID_BLOCK: 1200,   // 20 min
  LONG_BLOCK: 1800,  // 30 min
} as const;
```

### BUG #8: Risky Fallback to MASTER_WORKOUTS[0]
**Severity:** HIGH  
**Location:** selectWorkoutTemplate() line 1361
**Code:**
```typescript
if (candidates.length === 0) {
  candidates = MASTER_WORKOUTS;
}
// ... later ...
return candidates[randomIndex] || MASTER_WORKOUTS[0];
```
**Issue:** If MASTER_WORKOUTS is empty, returns undefined or undefined[0]  
**Risk:** Could crash in production if database fails to load  
**Fix:** Add guard:
```typescript
if (!MASTER_WORKOUTS || MASTER_WORKOUTS.length === 0) {
  console.error('[selectWorkoutTemplate] CRITICAL: MASTER_WORKOUTS is empty!');
  throw new Error('Database failed to load - no workouts available');
}
```

### BUG #9: Missing Null Check for session.intervals
**Severity:** MEDIUM  
**Location:** fixSessionDuration() line 1697
**Code:**
```typescript
const totalSecs = session.intervals.reduce((s, i) => s + i.durationSecs, 0);
```
**Issue:** If session.intervals is undefined/null, crashes  
**Risk:** Could happen if generateRestDay() is called (empty intervals)  
**Fix:**
```typescript
const totalSecs = (session.intervals || []).reduce((s, i) => s + i.durationSecs, 0);
```

### BUG #10: Potential Array Index Out of Bounds
**Severity:** MEDIUM  
**Location:** generateIndoorSession() line 1420
**Code:**
```typescript
const dayIndex = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(day);
let zone: string;
let isMonday = dayIndex === 0;
```
**Issue:** If `day` not in array, dayIndex = -1, isMonday becomes false, but no error  
**Risk:** Silent bug, zone selection fails  
**Fix:**
```typescript
const dayIndex = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(day);
if (dayIndex === -1) {
  throw new Error(`Invalid day: ${day}`);
}
```

### BUG #11: console.log/warn Left in Production Code
**Severity:** LOW-MEDIUM  
**Location:** Multiple files
**Found:**
- periodization.ts line 1432: console.log visible in production
- periodization.ts line 1666: console.warn visible
- sessions-data-all.ts: console.error statements

**Issue:** Clutters browser console, potential performance impact  
**Fix:** Wrap in DEBUG flag or remove entirely

---

## SECTION B: CODE DUPLICATION

### DUPLICATION #1: candidates.filter() Pattern (5 occurrences)
**Lines:** 1286, 1289, 1314, 1327, 1337, 1345

**Current:**
```typescript
// Location 1: Line 1286
candidates = candidates.filter(w => w.category === category);

// Location 2: Line 1314
difficultyCandidates = candidates.filter(w => 
  w.difficultyScore >= minDifficulty && 
  w.difficultyScore <= maxDifficulty
);

// Location 3: Line 1327
const variantMatches = candidates.filter(w => 
  !w.sportVariant || w.sportVariant === specialization
);

// Location 4: Line 1337
const weeklyUniqueOnly = candidates.filter(w => !usedThisWeekIds.includes(w.id));

// Location 5: Line 1345
const nonRepeatCandidates = candidates.filter(w => w.id !== previousTemplateId);
```

**Issue:** Repetitive filtering logic, hard to test/maintain  
**Fix:** Extract to helper function:
```typescript
function filterWorkouts(
  candidates: WorkoutTemplate[],
  filterFn: (w: WorkoutTemplate) => boolean,
  fallback: WorkoutTemplate[] = []
): WorkoutTemplate[] {
  const result = candidates.filter(filterFn);
  return result.length > 0 ? result : fallback;
}
```

### DUPLICATION #2: Duration-based scaling logic
**Appears:** 3 times in generateWeekSessions → generateIndoorSession → fixSessionDuration  
**Issue:** Same calculation done in multiple places
```typescript
// Could be unified into one function
const scaledDuration = calculateScaledDuration(
  template.duration,
  weekType,
  userTargetDuration
);
```

### DUPLICATION #3: Day iteration pattern
**Lines:** 1210, 1793, 1861  
**Pattern:**
```typescript
for (const day of allDays) {
  let session: SessionDef;
  if (!trainingDays.includes(day)) {
    session = generateRestDay(day);
  } else {
    // ... complex logic
  }
}
```
**Issue:** Repeated 3x in different functions  
**Fix:** Extract to utility function:
```typescript
function generateDaySession(
  day: DayOfWeek,
  trainingDays: DayOfWeek[],
  config: GenerateConfig
): SessionDef {
  if (!trainingDays.includes(day)) {
    return generateRestDay(day);
  }
  // ... rest of logic
}
```

---

## SECTION C: TYPE SAFETY ISSUES

### TYPE ISSUE #1: Implicit 'any' in Callbacks
**Location:** Multiple .map() and .filter() calls  
**Code:**
```typescript
.map((_, weekIdx) => { ... })     // weekIdx is implicitly any
.forEach(s => { ... })             // s is implicitly any
```
**Fix:** Add explicit types:
```typescript
.map((_, weekIdx: number) => { ... })
.forEach((s: SessionDef) => { ... })
```

### TYPE ISSUE #2: Optional Parameters Not Always Checked
**Location:** generateIndoorSession() parameters  
**Parameters:** previousTemplates?, userSeed?, targetDurationMinutes?, usedThisWeekIds?  
**Issue:** Some code assumes they exist without null checks  
**Example:**
```typescript
const userHash = userSeed ? Math.abs(...) : 0;  // OK
const duration = targetDurationMinutes || 60;   // OK
const used = usedThisWeekIds.includes(w.id);    // ⚠️ NO NULL CHECK!
```

---

## SECTION D: LOGIC BUGS

### LOGIC BUG #1: usedThisWeekIds Not Reset Between Weeks
**Location:** generatePlan() line 1755 onwards  
**Issue:**
```typescript
const usedThisWeekIds: string[] = [];  // Declared ONCE at week level
for (const day of allDays) {
  // ... usedThisWeekIds is passed and mutated
  usedThisWeekIds.push(session.templateId);
}
// Next week, usedThisWeekIds still has previous week's data!
```
**Impact:** Variety enforcement breaks across weeks  
**Fix:** Reset per-week:
```typescript
let weeklyUsedIds: string[] = [];
// ... process week
weeklyUsedIds = [];  // Reset for next week
```

### LOGIC BUG #2: Difficulty Range Filter Fallback Too Permissive
**Location:** line 1317
**Code:**
```typescript
if (difficultyCandidates.length > 0) {
  candidates = difficultyCandidates;  // Only update if found
}
// If not found, keeps ALL candidates (no difficulty filter!)
```
**Issue:** If hard week needs difficulty 8-10, but only gets 5, still uses 5  
**Better approach:**
```typescript
candidates = difficultyCandidates.length > 0 
  ? difficultyCandidates 
  : candidates.filter(w => w.difficultyScore >= minDifficulty);
// At least enforce minimum difficulty
```

---

## SECTION E: MISSING ERROR HANDLING

### MISSING #1: No error if fixSessionDuration receives invalid input
**Location:** line 1678  
**Code:**
```typescript
export function fixSessionDuration(
  session: SessionDef,
  weekType: WeekType,
  useRequestedDuration?: boolean,
  requestedDurationMinutes?: number
): SessionDef {
  // No validation of inputs!
```

### MISSING #2: No error if MASTER_WORKOUTS fails to load
**Location:** sessions-data-all.ts  
**Already partially fixed in Round 1, but needs:**
```typescript
export const MASTER_WORKOUTS_READY = MASTER_WORKOUTS.length > 0;
// Add check on app startup
```

### MISSING #3: No error if athlete/rider not found
**Location:** src/app/api/plan/route.ts line 42
```typescript
const rider = await prisma.rider.findUnique(...);
// No check if rider is null!
```

---

## SUMMARY OF FIXES NEEDED

| # | Bug | Severity | Type | Fix Effort |
|---|-----|----------|------|-----------|
| 7 | Hardcoded magic numbers | MEDIUM | Duplication | 30 min |
| 8 | Risky MASTER_WORKOUTS[0] | HIGH | Logic | 15 min |
| 9 | Missing null check (intervals) | MEDIUM | Type Safety | 5 min |
| 10 | Array index out of bounds | MEDIUM | Logic | 10 min |
| 11 | console.log in production | LOW | Cleanup | 5 min |
| D1 | candidates.filter() duplication | MEDIUM | Duplication | 20 min |
| D2 | Duration scaling logic duplication | MEDIUM | Duplication | 15 min |
| T1 | Implicit 'any' in callbacks | LOW | Type Safety | 10 min |
| L1 | usedThisWeekIds not reset | MEDIUM | Logic | 10 min |
| E1 | No input validation | MEDIUM | Error Handling | 15 min |

**TOTAL: ~2 hours to fix all issues**
