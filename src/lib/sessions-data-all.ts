/**
 * MASTER WORKOUTS DATABASE - ALL SOURCES
 * - 63 Classified (helperfunction-based)
 * - 55 Research V1
 * - 47 Research V2
 * - 77 Zwift (NEW)
 * TOTAL: 242 workouts (pre-deduplication)
 * 
 * All converted to percentage-based durations
 */

import type { WorkoutTemplate } from './periodization';
import { MASTER_WORKOUTS as CLASSIFIED } from './sessions-data-classified';
import { RESEARCH_WORKOUTS } from './research-workouts';
import { RESEARCH_WORKOUTS_V2 } from './research-workouts-v2';
import { ZWIFT_WORKOUTS } from './zwift-workouts';

// Combine all sources
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
