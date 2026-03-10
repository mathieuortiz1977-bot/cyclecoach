/**
 * FLEXIBLE WORKOUT DATA LOADER
 * 
 * Loads workout JSON files from /workouts/{source}/*.json
 * Converts JSON → WorkoutTemplate interface
 * Handles missing/malformed files gracefully
 * 
 * Design: File-based loading for easy corrections
 * When Carlos sends updated JSON files, just drop them in
 * No code changes needed
 * 
 * NOTE: Uses dynamic fs imports for Next.js compatibility
 * (fs only available on server-side)
 */

import type { WorkoutTemplate } from './periodization';

/**
 * Convert raw JSON workout → WorkoutTemplate interface
 * Validates required fields, provides defaults for optional fields
 */
export function convertWorkoutJSON(jsonData: any): WorkoutTemplate | null {
  try {
    // Validate required fields
    if (!jsonData.id || !jsonData.title) {
      console.warn(`[Workout Load] Skipping malformed workout: missing id or title`);
      return null;
    }

    // Create intervals function from static array
    // This allows normalizeIntervals() to work as expected
    const staticIntervals = jsonData.intervals || [];
    const intervalsFunction = () => staticIntervals;

    const converted: WorkoutTemplate = {
      id: jsonData.id,
      title: jsonData.title,
      description: jsonData.description || '',
      purpose: jsonData.purpose || '',
      zone: jsonData.primaryZone || 'Z2',
      duration: jsonData.duration || 60,
      category: jsonData.category || 'MIXED',
      
      // New fields from normalized structure (optional)
      source: jsonData.source,
      protocol: jsonData.protocol,
      researcher: jsonData.researcher,
      structure: jsonData.structure,
      difficultyScore: jsonData.difficulty || jsonData.difficultyScore || 5,
      sportVariant: jsonData.sportVariant,
      
      // CRITICAL: Convert intervals array → function
      intervals: intervalsFunction,
    };

    return converted;
  } catch (error) {
    console.error(`[Workout Load] Error converting workout ${jsonData?.id}:`, error);
    return null;
  }
}

/**
 * Load all normalized workouts from all sources (ASYNC)
 * Returns master list ready for selectWorkoutTemplate()
 * SERVER-SIDE ONLY
 * 
 * This is the async entry point (use if you need parallel loading)
 */
export async function loadAllNormalizedWorkouts(
  workoutsRoot?: string
): Promise<WorkoutTemplate[]> {
  // For now, just wrap the sync version in a Promise
  // Can be optimized later with actual async file I/O
  return new Promise((resolve) => {
    const workouts = loadAllNormalizedWorkoutsSync(workoutsRoot);
    resolve(workouts);
  });
}

/**
 * Synchronous version for compatibility with existing code
 * SERVER-SIDE ONLY - Uses Node.js fs module
 * (fs is not available in browser/client-side code)
 * 
 * Loads from all 9 sources:
 * - Original: carlos, zwift, research
 * - New: british-cycling, dylan-johnson, san-millan, sufferfest, trainerroad, xert
 */
export function loadAllNormalizedWorkoutsSync(
  workoutsRoot?: string
): WorkoutTemplate[] {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    console.warn('[Workout Load] Cannot load from disk in browser context');
    return [];
  }

  // Dynamic import of fs (Node.js only)
  let fs: any;
  let path: any;
  
  try {
    fs = require('fs');
    path = require('path');
  } catch (e) {
    console.warn('[Workout Load] fs/path modules not available in this context');
    return [];
  }

  const root = workoutsRoot || path.join(process.cwd(), 'src', 'lib', 'workouts');
  console.log('[Workout Load] Starting comprehensive workout database load (sync)...');
  
  const allWorkouts: WorkoutTemplate[] = [];
  const sources = [
    'carlos',
    'zwift',
    'research',
    'british-cycling',
    'dylan-johnson',
    'san-millan',
    'sufferfest',
    'trainerroad',
    'xert',
  ] as const;
  
  try {
    // Load each source sequentially
    const loadedBySource: Record<string, number> = {};
    
    for (const source of sources) {
      const sourceWorkouts = loadWorkoutsFromDirectorySync(source, root, fs, path);
      allWorkouts.push(...sourceWorkouts);
      loadedBySource[source] = sourceWorkouts.length;
    }

    console.log(`[Workout Load] Total loaded: ${allWorkouts.length} workouts`);
    console.log(`[Workout Load] Breakdown by source:`);
    for (const [source, count] of Object.entries(loadedBySource)) {
      if (count > 0) {
        console.log(`[Workout Load]   - ${source}: ${count}`);
      }
    }

    return allWorkouts;
  } catch (error) {
    console.error('[Workout Load] Fatal error during database load:', error);
    return allWorkouts; // Return partial results if one source fails
  }
}

/**
 * Synchronous version of loadWorkoutsFromDirectory
 * (Internal function - requires fs/path as parameters)
 * 
 * Supports all 9 sources:
 * Original: carlos, zwift, research
 * New: british-cycling, dylan-johnson, san-millan, sufferfest, trainerroad, xert
 */
function loadWorkoutsFromDirectorySync(
  sourceDir: 'carlos' | 'zwift' | 'research' | 'british-cycling' | 'dylan-johnson' | 'san-millan' | 'sufferfest' | 'trainerroad' | 'xert',
  workoutsRoot: string,
  fs: any,
  path: any
): WorkoutTemplate[] {
  const dirPath = path.join(workoutsRoot, sourceDir);
  const results: WorkoutTemplate[] = [];
  
  try {
    if (!fs.existsSync(dirPath)) {
      console.warn(`[Workout Load] Directory not found: ${dirPath}`);
      return results;
    }

    const files = fs.readdirSync(dirPath).filter((f: string) => f.endsWith('.json'));
    console.log(`[Workout Load] Found ${files.length} JSON files in ${sourceDir}/`);

    for (const file of files) {
      try {
        const filePath = path.join(dirPath, file);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(rawContent);
        
        const converted = convertWorkoutJSON(jsonData);
        if (converted) {
          results.push(converted);
        }
      } catch (fileError) {
        console.error(`[Workout Load] Error loading ${file}:`, fileError);
      }
    }

    console.log(`[Workout Load] Loaded ${results.length} workouts from ${sourceDir}/`);
    return results;
  } catch (error) {
    console.error(`[Workout Load] Error reading directory ${dirPath}:`, error);
    return results;
  }
}
