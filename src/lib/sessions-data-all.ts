/**
 * MASTER WORKOUTS DATABASE - ALL SOURCES
 * - 63 Classified (helperfunction-based)
 * - 55 Research V1
 * - 47 Research V2
 * - 77 Zwift (NEW)
 * TOTAL: 242 workouts (pre-deduplication)
 * 
 * All converted to percentage-based durations
 * 
 * BUG #6 FIX: Error handling for database imports
 */

import type { WorkoutTemplate } from './periodization';

// Import with error handling (BUG #6 fix)
let CLASSIFIED: WorkoutTemplate[] = [];
let RESEARCH_WORKOUTS: WorkoutTemplate[] = [];
let RESEARCH_WORKOUTS_V2: WorkoutTemplate[] = [];
let ZWIFT_WORKOUTS: WorkoutTemplate[] = [];

try {
  const classified = require('./sessions-data-classified');
  CLASSIFIED = classified.MASTER_WORKOUTS || [];
} catch (e) {
  console.error('[Database] Failed to load CLASSIFIED workouts:', e);
}

try {
  const research = require('./research-workouts');
  RESEARCH_WORKOUTS = research.RESEARCH_WORKOUTS || [];
} catch (e) {
  console.error('[Database] Failed to load RESEARCH_WORKOUTS:', e);
}

try {
  const researchV2 = require('./research-workouts-v2');
  RESEARCH_WORKOUTS_V2 = researchV2.RESEARCH_WORKOUTS_V2 || [];
} catch (e) {
  console.error('[Database] Failed to load RESEARCH_WORKOUTS_V2:', e);
}

try {
  const zwift = require('./zwift-workouts');
  ZWIFT_WORKOUTS = zwift.ZWIFT_WORKOUTS || [];
} catch (e) {
  console.error('[Database] Failed to load ZWIFT_WORKOUTS:', e);
}

// Combine all sources with fallback
const ALL_WORKOUTS: WorkoutTemplate[] = [
  ...CLASSIFIED,
  ...RESEARCH_WORKOUTS,
  ...RESEARCH_WORKOUTS_V2,
  ...ZWIFT_WORKOUTS,
];

// Deduplication: remove exact ID duplicates (keep first occurrence)
const SEEN_IDS = new Set<string>();
export const MASTER_WORKOUTS_DEDUPED: WorkoutTemplate[] = [];

for (const workout of ALL_WORKOUTS) {
  if (!SEEN_IDS.has(workout.id)) {
    SEEN_IDS.add(workout.id);
    MASTER_WORKOUTS_DEDUPED.push(workout);
  }
}

console.log(`[Sessions Database] Loaded 242 workouts → ${MASTER_WORKOUTS_DEDUPED.length} unique after ID deduplication`);

export const MASTER_WORKOUTS = MASTER_WORKOUTS_DEDUPED;
export const TOTAL_WORKOUTS = MASTER_WORKOUTS.length;
