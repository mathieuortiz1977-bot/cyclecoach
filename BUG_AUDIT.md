# BUG AUDIT - CycleCoach Training System

## CRITICAL BUGS FOUND

### BUG #1: Sunday Default to Rest Day
**Location:** src/lib/periodization.ts line 1191, 1209-1211
**Issue:** Default trainingDays excludes Sunday: `["MON", "TUE", "THU", "FRI", "SAT"]`
**Impact:** Sunday always becomes "Rest Day" unless explicitly passed in trainingDays
**Fix:** Change default to include Sunday OR treat Sunday as regular training day with optional separate duration
**Carlos's requirement:** "Sunday is a regular day, NO rest day by default. Only difference is duration might be different"

### BUG #2: Wednesday Missing from Default
**Location:** Same location
**Issue:** Wednesday (WED) is excluded from default training days
**Impact:** Users get Wednesday rest by default, may not be intended
**Fix:** Either include WED or document intention

### BUG #3: Sunday Duration Parameter Not Intuitive
**Location:** src/lib/periodization.ts multiple locations
**Issue:** `targetSundayDurationMinutes` is a separate parameter, but Carlos wants Sunday treated like any other day
**Fix:** Remove special Sunday parameter, just use normal targetDurationMinutes for Sunday too

### BUG #4: Rest Day Generation Creates Empty Intervals
**Location:** src/lib/periodization.ts line 1370-1378
**Issue:** generateRestDay() returns empty intervals array, may cause downstream issues
**Fix:** Document or handle empty intervals properly in dashboard

## MEDIUM BUGS

### BUG #5: No Validation for User's Target Duration
**Location:** generateIndoorSession() 
**Issue:** If user passes 0 or negative duration, system may crash or behave unexpectedly
**Fix:** Add validation: `targetDurationMinutes >= 30`

### BUG #6: MASTER_WORKOUTS Import Could Fail Silently
**Location:** src/lib/sessions-data-all.ts
**Issue:** If any of the 4 import files fails, entire database fails
**Fix:** Add try-catch and fallback

## CODE QUALITY ISSUES

### ISSUE #7: TypeScript "any" Types
**Location:** zwift-workouts.ts
**Issue:** Helper functions use generic `any[]` types
**Fix:** Use proper WorkoutTemplate types

### ISSUE #8: No Error Boundary for Missing Categories
**Location:** selectWorkoutTemplate()
**Issue:** If requested category doesn't exist, falls back silently
**Fix:** Log warning or throw error

---

## FIXES TO APPLY

1. ✅ Remove Sunday from rest day logic - treat as regular day
2. ✅ Include WED and SUN in default trainingDays
3. ✅ Remove targetSundayDurationMinutes special case
4. ✅ Use same duration parameter for all days
5. ✅ Add duration validation
6. ✅ Add error handling for database imports
7. ✅ Fix TypeScript types in Zwift workouts
