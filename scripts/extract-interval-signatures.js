#!/usr/bin/env node
/**
 * EXTRACT INTERVAL SIGNATURES
 * 
 * Scans all workouts and extracts unique interval types
 * to understand the full scope of coaching notes needed
 */

const fs = require('fs');
const path = require('path');

// Load all workout data
const classified = require('../src/lib/sessions-data-classified.json');
const researchV1 = require('../src/lib/research-workouts.json');
const researchV2 = require('../src/lib/research-workouts-v2.json');

// Note: Zwift workouts are in TypeScript, so we'll estimate based on what we know

const allWorkouts = [
  ...classified.MASTER_WORKOUTS || classified,
  ...researchV1.RESEARCH_WORKOUTS || researchV1,
  ...researchV2.RESEARCH_WORKOUTS_V2 || researchV2,
];

const uniqueIntervals = new Set();
const intervalsByType = {};

console.log('\n📊 ANALYZING WORKOUT DATABASE\n');
console.log(`Total workouts found: ${allWorkouts.length}\n`);

let totalIntervals = 0;
let processedWorkouts = 0;

for (const workout of allWorkouts) {
  if (!workout.intervals) continue;
  processedWorkouts++;
  
  // Handle both array and function intervals
  const intervals = typeof workout.intervals === 'function' 
    ? workout.intervals() 
    : workout.intervals;
  
  if (!Array.isArray(intervals)) continue;
  
  for (const interval of intervals) {
    totalIntervals++;
    
    // Create signature: name + zone + power range
    const sig = `${interval.name}__${interval.zone}__${interval.powerLow}-${interval.powerHigh}`;
    uniqueIntervals.add(sig);
    
    // Track by type for analysis
    if (!intervalsByType[interval.name]) {
      intervalsByType[interval.name] = new Set();
    }
    intervalsByType[interval.name].add(sig);
  }
}

console.log(`✅ Processed ${processedWorkouts} workouts`);
console.log(`✅ Found ${totalIntervals} total intervals`);
console.log(`✅ Found ${uniqueIntervals.size} UNIQUE interval signatures\n`);

// Analyze by interval name
console.log('📋 INTERVAL TYPES & VARIATIONS:\n');

const sortedByCount = Object.entries(intervalsByType)
  .map(([name, sigs]) => ({
    name,
    count: sigs.size,
    variations: Array.from(sigs)
  }))
  .sort((a, b) => b.count - a.count);

for (const { name, count, variations } of sortedByCount) {
  console.log(`${name}: ${count} variation(s)`);
  if (count <= 3) {
    for (const v of variations) {
      const [, zone, power] = v.split('__');
      console.log(`  - ${zone} @ ${power}% FTP`);
    }
  }
}

console.log(`\n📈 COACHING NOTES NEEDED: ${uniqueIntervals.size} × 4 personalities = ${uniqueIntervals.size * 4} notes`);
console.log(`\n💾 Exporting unique signatures...\n`);

// Save to file
const output = {
  totalWorkouts: allWorkouts.length,
  processedWorkouts,
  totalIntervals,
  uniqueSignatures: uniqueIntervals.size,
  coachingNotesNeeded: uniqueIntervals.size * 4,
  intervals: Array.from(uniqueIntervals).sort(),
};

const outputPath = path.join(process.cwd(), 'scripts/interval-signatures.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✅ Saved ${output.uniqueSignatures} unique interval signatures to:`);
console.log(`   ${outputPath}`);
console.log(`\n⏭️  Next: Generate ${output.coachingNotesNeeded} coaching notes\n`);
