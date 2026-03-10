#!/usr/bin/env node

/**
 * Parse Carlos's 105-workout markdown database
 * Convert to TypeScript format for integration
 */

const fs = require('fs');
const path = require('path');

// Read the markdown
const mdPath = path.resolve(path.join(__dirname, '../../..', '.openclaw/workspace/carlos-105-workouts.md'));
const content = fs.readFileSync(mdPath, 'utf8');

// Extract all workout blocks
const workoutPattern = /^### (W\d{3})\s+–\s+(.+)$/gm;
const matches = [...content.matchAll(workoutPattern)];

console.log(`Found ${matches.length} workouts`);

const workouts = [];

matches.forEach((match, idx) => {
  const id = match[1];
  const title = match[2];
  const start = match.index;
  const nextMatch = matches[idx + 1];
  const end = nextMatch ? nextMatch.index : content.length;
  const block = content.substring(start, end);

  // Extract key details
  const goal = block.match(/- \*\*Goal:\*\*\s+(.+)/)?.[1] || '';
  const duration = block.match(/- \*\*Total Duration:\*\*\s+(.+)/)?.[1] || '';
  const tss = block.match(/\*\*Est\. TSS:\*\*\s+(\d+)/)?.[1] || '0';

  // Extract structure
  const structureStart = block.indexOf('- **Structure:**');
  const notesStart = block.indexOf('- **Notes:**');
  const structure = structureStart !== -1 
    ? block.substring(structureStart + 15, notesStart !== -1 ? notesStart : block.length).trim()
    : '';

  workouts.push({
    id,
    title,
    goal,
    duration,
    tss,
    structure,
    category: inferCategory(title),
  });
});

console.log('\nExtracted workouts:');
workouts.slice(0, 5).forEach(w => {
  console.log(`\n${w.id} – ${w.title}`);
  console.log(`  Category: ${w.category}`);
  console.log(`  Duration: ${w.duration}`);
  console.log(`  TSS: ${w.tss}`);
});

console.log(`\n... and ${workouts.length - 5} more`);

// Write summary
fs.writeFileSync(
  path.join(__dirname, '../src/lib/carlos-105-workouts.json'),
  JSON.stringify(workouts, null, 2),
  'utf8'
);

console.log(`\n✅ Exported ${workouts.length} workouts to carlos-105-workouts.json`);

function inferCategory(title) {
  const lower = title.toLowerCase();
  
  if (lower.includes('endurance') || lower.includes('steady')) return 'BASE';
  if (lower.includes('tempo')) return 'TEMPO';
  if (lower.includes('sweet spot') || lower.includes('ftp')) return 'THRESHOLD';
  if (lower.includes('vo2') || lower.includes('vo2max')) return 'VO2MAX';
  if (lower.includes('anaerobic') || lower.includes('anaerobic')) return 'ANAEROBIC';
  if (lower.includes('sprint') || lower.includes('power')) return 'SPRINT';
  if (lower.includes('recovery') || lower.includes('easy')) return 'RECOVERY';
  
  return 'BASE'; // default
}
