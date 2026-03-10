/**
 * Coaching Notes Loader
 * 
 * Loads personality-specific coaching notes and maps them to intervals
 * based on their type (name), zone, and power target
 */

import coachingNotesData from './coaching-notes-all.json';
import type { CoachPersonality } from './ai-coach';

interface CoachingNotesMap {
  [key: string]: {
    [personality: string]: string;
  };
}

const COACHING_NOTES: CoachingNotesMap = coachingNotesData as CoachingNotesMap;

/**
 * Get coaching note for an interval based on its characteristics
 * 
 * @param intervalName - Name of the interval (e.g., "VO2 Max", "Warmup")
 * @param zone - Zone (e.g., "Z5", "Z1-Z2")
 * @param powerLow - Low power % FTP
 * @param powerHigh - High power % FTP
 * @param personality - Coach personality (DARK_HUMOR, MOTIVATIONAL, TECHNICAL, MIXED)
 * @returns Coaching note string, or fallback if not found
 */
export function getCoachingNote(
  intervalName: string,
  zone: string,
  powerLow: number,
  powerHigh: number,
  personality: CoachPersonality = 'MIXED'
): string {
  // Build the key for lookup
  const key = `${intervalName}__${zone}__${powerLow}-${powerHigh}`;
  
  // Try exact match first
  if (COACHING_NOTES[key] && COACHING_NOTES[key][personality]) {
    return COACHING_NOTES[key][personality];
  }
  
  // Fallback: try to find a note by interval name and zone alone
  const partialKey = Object.keys(COACHING_NOTES).find(k => 
    k.startsWith(`${intervalName}__${zone}`)
  );
  
  if (partialKey && COACHING_NOTES[partialKey] && COACHING_NOTES[partialKey][personality]) {
    return COACHING_NOTES[partialKey][personality];
  }
  
  // Last resort: return a generic fallback
  return `You've got this. Stay focused on ${intervalName} and execute the plan.`;
}

/**
 * Get ALL personality variants for an interval
 * Used by AICoachPanel to show all 4 personalities
 * 
 * @param intervalName - Name of the interval
 * @param zone - Zone
 * @param powerLow - Low power %
 * @param powerHigh - High power %
 * @returns Object with all 4 personality notes
 */
export function getAllCoachingNotes(
  intervalName: string,
  zone: string,
  powerLow: number,
  powerHigh: number
): Record<CoachPersonality, string> {
  const personalities: CoachPersonality[] = ['DARK_HUMOR', 'MOTIVATIONAL', 'TECHNICAL', 'MIXED'];
  
  return {
    DARK_HUMOR: getCoachingNote(intervalName, zone, powerLow, powerHigh, 'DARK_HUMOR'),
    MOTIVATIONAL: getCoachingNote(intervalName, zone, powerLow, powerHigh, 'MOTIVATIONAL'),
    TECHNICAL: getCoachingNote(intervalName, zone, powerLow, powerHigh, 'TECHNICAL'),
    MIXED: getCoachingNote(intervalName, zone, powerLow, powerHigh, 'MIXED'),
  };
}

/**
 * List all available coaching note interval types
 */
export function getAvailableIntervalTypes(): string[] {
  return Object.keys(COACHING_NOTES).map(key => {
    const [name] = key.split('__');
    return name;
  }).filter((value, index, self) => self.indexOf(value) === index); // unique
}

export default COACHING_NOTES;
