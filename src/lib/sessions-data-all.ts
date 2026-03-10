/**
 * MASTER WORKOUTS DATABASE - ALL SOURCES
 * 
 * CRITICAL FIX: File loading is DELAYED and GUARDED
 * Prevents "Cannot load from disk in browser context" errors
 * 
 * Server code: Call getMasterWorkoutsSync() or use workouts-data.server.ts
 * Client code: Use API endpoint /api/workouts (NOT periodization.ts directly)
 */

import type { WorkoutTemplate } from './periodization';

// Lazy-loaded cache (server-side only)
let _MASTER_WORKOUTS: WorkoutTemplate[] | null = null;
let _LOAD_ATTEMPTED = false;
let _IS_CLIENT = false;

// Detect if running on client (at module load time, before any async)
try {
  _IS_CLIENT = typeof window !== 'undefined';
} catch {
  _IS_CLIENT = false;
}

/**
 * Initialize and get master workouts (SERVER-SIDE ONLY)
 * Safe to call from server actions and API routes
 */
export function getMasterWorkoutsSync(): WorkoutTemplate[] {
  // Guard: Don't load on client-side
  if (_IS_CLIENT) {
    console.warn('[Sessions Database] File loading skipped on client-side');
    return [];
  }

  // Load only once (server-side)
  if (_LOAD_ATTEMPTED) {
    return _MASTER_WORKOUTS || [];
  }

  _LOAD_ATTEMPTED = true;

  try {
    console.log('[Sessions Database] Initializing master workouts (server-side)...');
    
    // Require dynamically to avoid client-side imports
    const { loadAllNormalizedWorkoutsSync } = require('./workouts-loader');
    const normalized = loadAllNormalizedWorkoutsSync();
    
    console.log(`[Sessions Database] Loaded ${normalized.length} normalized workouts`);
    
    // Fallback to classified workouts if available
    let classified: WorkoutTemplate[] = [];
    try {
      const classifiedModule = require('./sessions-data-classified');
      classified = classifiedModule.MASTER_WORKOUTS || [];
      console.log(`[Sessions Database] Loaded ${classified.length} fallback classified workouts`);
    } catch (error) {
      console.warn('[Sessions Database] No classified fallback');
    }

    // Combine and deduplicate
    const allWorkouts = [...normalized, ...classified];
    const seenIds = new Set<string>();
    const deduped: WorkoutTemplate[] = [];

    for (const workout of allWorkouts) {
      if (!seenIds.has(workout.id)) {
        seenIds.add(workout.id);
        deduped.push(workout);
      }
    }

    _MASTER_WORKOUTS = deduped;
    console.log(`[Sessions Database] Master database ready: ${_MASTER_WORKOUTS.length} workouts`);

    return _MASTER_WORKOUTS;
  } catch (error) {
    console.error('[Sessions Database] CRITICAL: Failed to initialize:', error);
    _MASTER_WORKOUTS = [];
    return [];
  }
}

/**
 * Backward compatibility: For code that expects MASTER_WORKOUTS to be available
 * This will be empty on client-side (safe) and loaded on server-side
 */
export const MASTER_WORKOUTS: WorkoutTemplate[] = _IS_CLIENT ? [] : getMasterWorkoutsSync();

/**
 * Total workouts count
 * Use getMasterWorkoutsSync().length for server code
 */
export const TOTAL_WORKOUTS = MASTER_WORKOUTS.length;
