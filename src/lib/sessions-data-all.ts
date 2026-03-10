/**
 * MASTER WORKOUTS DATABASE - ALL SOURCES
 * 
 * FLEXIBLE FILE-BASED LOADING
 * Loads workouts from /workouts/{carlos,zwift,research}/*.json
 * Can be updated anytime without code changes
 * 
 * Sources:
 * - Carlos: 105 workouts
 * - Zwift: 68 workouts  
 * - Research: 47 workouts
 * TOTAL: 220 workouts
 * 
 * All converted to normalized percentage-based duration structure
 * 
 * DESIGN: File-based loading for easy corrections
 * When corrections are sent, just drop updated JSON files in place
 */

import type { WorkoutTemplate } from './periodization';
import { loadAllNormalizedWorkoutsSync } from './workouts-loader';

// ─── LOAD NORMALIZED WORKOUTS FROM JSON FILES ──────────────────────

let NORMALIZED_WORKOUTS: WorkoutTemplate[] = [];

try {
  console.log('[Database] Loading normalized workouts from JSON files...');
  NORMALIZED_WORKOUTS = loadAllNormalizedWorkoutsSync();
  console.log(`[Database] Successfully loaded ${NORMALIZED_WORKOUTS.length} normalized workouts`);
} catch (error) {
  console.error('[Database] CRITICAL: Failed to load normalized workouts:', error);
  NORMALIZED_WORKOUTS = [];
}

// ─── KEEP LEGACY CLASSIFIED WORKOUTS (FOR NOW) ──────────────────────
// These will be deprecated once corrections are finalized
let CLASSIFIED: WorkoutTemplate[] = [];

try {
  const classified = require('./sessions-data-classified');
  CLASSIFIED = classified.MASTER_WORKOUTS || [];
  console.log(`[Database] Loaded ${CLASSIFIED.length} legacy classified workouts (fallback)`);
} catch (e) {
  console.warn('[Database] Could not load classified workouts (expected, will use normalized):', e);
}

// ─── COMBINE SOURCES ────────────────────────────────────────────────
// Priority: Normalized JSON > Legacy Classified
// This gives us a graceful migration path

const ALL_WORKOUTS: WorkoutTemplate[] = [
  ...NORMALIZED_WORKOUTS,  // Load normalized first (takes priority)
  ...CLASSIFIED,           // Fallback to classified if normalized fails
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

console.log(`[Sessions Database] Final database: ${MASTER_WORKOUTS_DEDUPED.length} unique workouts`);
console.log(`[Sessions Database]   - From normalized JSON: ${NORMALIZED_WORKOUTS.length}`);
console.log(`[Sessions Database]   - From legacy fallback: ${CLASSIFIED.length}`);

export const MASTER_WORKOUTS = MASTER_WORKOUTS_DEDUPED;
export const TOTAL_WORKOUTS = MASTER_WORKOUTS.length;
