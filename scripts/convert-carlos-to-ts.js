#!/usr/bin/env node

/**
 * Convert Carlos's 105 workouts to TypeScript WorkoutTemplate format
 */

const fs = require('fs');
const path = require('path');

const workoutsJson = require('../src/lib/carlos-105-workouts.json');

// Generate TypeScript code for all 105 workouts
let tsCode = `/**
 * RESEARCH WORKOUTS: Carlos's 105-Workout Database
 * Extracted from email (March 9, 2026)
 * 
 * These are research-backed structured interval workouts
 * for indoor and outdoor cycling, organized by energy system
 * and training goal. All power targets are % of FTP.
 */

import type { WorkoutTemplate } from './periodization';

// Research workouts (W001-W105)
export const RESEARCH_WORKOUTS: WorkoutTemplate[] = [
`;

workoutsJson.forEach((w, idx) => {
  const intervals = parseWorkoutStructure(w);
  const duration = parseDuration(w.duration);
  const mainZone = intervals[0]?.zone || 'Z2';
  const difficultyScore = mapTSDifficulty(w.category, w.tss);
  
  tsCode += `
  // ${w.id} – ${w.title}
  {
    id: '${w.id.toLowerCase()}',
    title: '${w.title}',
    category: '${w.category}',
    description: '${w.goal}',
    purpose: '${w.goal}',
    zone: '${mainZone}',
    duration: ${duration},
    difficultyScore: ${difficultyScore},
    intervals: () => [
${intervals.map(i => `      { name: '${i.name}', zone: '${i.zone}', powerLow: ${i.powerLow}, powerHigh: ${i.powerHigh}, durationSecs: ${i.durationSecs}, coachNote: '${i.coachNote}', purpose: '${w.goal}' }`).join(',\n')}
    ],
  },
`;
});

tsCode += `
];

export const RESEARCH_WORKOUTS_BY_ID = new Map(
  RESEARCH_WORKOUTS.map(w => [w.id, w])
);
`;

// Write to file
const outputPath = path.join(__dirname, '../src/lib/research-workouts.ts');
fs.writeFileSync(outputPath, tsCode, 'utf8');

console.log(`✅ Generated ${workoutsJson.length} research workouts`);
console.log(`   Output: ${outputPath}`);

function parseWorkoutStructure(workout) {
  // Parse the structure field to extract intervals
  const intervals = [];
  const structure = workout.structure || '';
  
  // Simple parsing: look for patterns like "X min at YY% FTP"
  const lines = structure.split('\n');
  
  let warmupPower = 50;
  let mainPower = 70;
  let cooldownPower = 50;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Warmup
    if (trimmed.includes('warm-up')) {
      const match = trimmed.match(/(\d+)\s*min.*?(\d+)%/);
      if (match) {
        intervals.push({
          name: 'Warm-up',
          zone: 'Z1-Z2',
          powerLow: 40,
          powerHigh: 65,
          durationSecs: parseInt(match[1]) * 60,
          coachNote: 'Easy spin, build gradually'
        });
      }
      return;
    }
    
    // Cool-down
    if (trimmed.includes('cool-down')) {
      const match = trimmed.match(/(\d+)\s*min/);
      if (match) {
        intervals.push({
          name: 'Cool-down',
          zone: 'Z1',
          powerLow: 40,
          powerHigh: 55,
          durationSecs: parseInt(match[1]) * 60,
          coachNote: 'Easy recovery spinning'
        });
      }
      return;
    }
    
    // Rest intervals
    if (trimmed.includes('min rest') || trimmed.includes('min recovery')) {
      const match = trimmed.match(/(\d+)\s*min/);
      if (match) {
        intervals.push({
          name: 'Rest',
          zone: 'Z1',
          powerLow: 40,
          powerHigh: 55,
          durationSecs: parseInt(match[1]) * 60,
          coachNote: 'Easy spinning, prepare for next effort'
        });
      }
      return;
    }
    
    // Main work intervals
    const workMatch = trimmed.match(/(\d+)\s*(?:×|x)?\s*(\d+)\s*min.*?(\d+)%.*?(\d+)%/);
    if (workMatch) {
      const reps = parseInt(workMatch[1]);
      const mins = parseInt(workMatch[2]);
      const powerLow = parseInt(workMatch[3]);
      const powerHigh = parseInt(workMatch[4]) || powerLow;
      
      for (let i = 0; i < reps; i++) {
        intervals.push({
          name: `Rep ${i+1}`,
          zone: categorizeZone(powerHigh),
          powerLow,
          powerHigh,
          durationSecs: mins * 60,
          coachNote: `${powerHigh}% FTP effort`
        });
      }
      return;
    }
    
    // Single power duration  
    const singleMatch = trimmed.match(/(\d+)\s*min\s+at\s+(\d+)%/);
    if (singleMatch) {
      const mins = parseInt(singleMatch[1]);
      const power = parseInt(singleMatch[2]);
      
      intervals.push({
        name: `${power}% effort`,
        zone: categorizeZone(power),
        powerLow: Math.max(40, power - 5),
        powerHigh: power + 5,
        durationSecs: mins * 60,
        coachNote: `${power}% FTP`
      });
    }
  });
  
  // If no intervals found, create default structure
  if (intervals.length === 0) {
    const duration = parseDuration(workout.duration);
    intervals.push({
      name: 'Main',
      zone: 'Z2',
      powerLow: 65,
      powerHigh: 75,
      durationSecs: (duration - 20) * 60, // subtract warm-up and cool-down
      coachNote: workout.goal
    });
  }
  
  return intervals;
}

function parseDuration(durationStr) {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 60;
}

function categorizeZone(power) {
  if (power < 55) return 'Z1';
  if (power < 75) return 'Z2';
  if (power < 90) return 'Z3';
  if (power < 105) return 'Z4';
  if (power < 120) return 'Z5';
  if (power < 150) return 'Z6';
  return 'Z7';
}

function mapTSDifficulty(category, tss) {
  // Map TSS to difficulty score (1-10)
  const tssNum = parseInt(tss);
  if (tssNum < 40) return 1;
  if (tssNum < 60) return 3;
  if (tssNum < 80) return 5;
  if (tssNum < 100) return 7;
  return 9;
}
