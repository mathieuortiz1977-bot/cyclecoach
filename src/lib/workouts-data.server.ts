/**
 * SERVER-SIDE ONLY: Workout database initialization
 * This file is only loaded/executed on the server
 * Client code should never import from this file
 * 
 * Use dynamic imports or API endpoints for client access
 */

'use server';

import type { WorkoutTemplate } from './periodization';
import { loadAllNormalizedWorkoutsSync } from './workouts-loader';

// ─── INITIALIZE MASTER WORKOUTS DATABASE ────────────────────────────

let _MASTER_WORKOUTS: WorkoutTemplate[] | null = null;

/**
 * Initialize and get the master workouts database
 * Server-side only - safe to call from server actions and API routes
 */
export function getMasterWorkouts(): WorkoutTemplate[] {
  // Initialize once
  if (_MASTER_WORKOUTS !== null) {
    return _MASTER_WORKOUTS;
  }

  try {
    console.log('[Workouts] Initializing master database...');
    
    // Load normalized workouts
    const normalized = loadAllNormalizedWorkoutsSync();
    console.log(`[Workouts] Loaded ${normalized.length} normalized workouts`);
    
    // Load fallback classified workouts
    let classified: WorkoutTemplate[] = [];
    try {
      const classifiedModule = require('./sessions-data-classified');
      classified = classifiedModule.MASTER_WORKOUTS || [];
      console.log(`[Workouts] Loaded ${classified.length} fallback classified workouts`);
    } catch (error) {
      console.warn('[Workouts] No classified fallback available');
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
    console.log(`[Workouts] Master database initialized: ${_MASTER_WORKOUTS.length} workouts`);
    
    return _MASTER_WORKOUTS;
  } catch (error) {
    console.error('[Workouts] CRITICAL: Failed to initialize:', error);
    _MASTER_WORKOUTS = [];
    return [];
  }
}

/**
 * Get a single workout by ID
 * Server-side only
 */
export function getWorkoutById(id: string): WorkoutTemplate | undefined {
  const workouts = getMasterWorkouts();
  return workouts.find(w => w.id === id);
}

/**
 * Filter workouts by category
 * Server-side only
 */
export function getWorkoutsByCategory(category: string): WorkoutTemplate[] {
  const workouts = getMasterWorkouts();
  return workouts.filter(w => w.category === category);
}

/**
 * Get total count of workouts
 * Server-side only
 */
export function getTotalWorkoutCount(): number {
  return getMasterWorkouts().length;
}
