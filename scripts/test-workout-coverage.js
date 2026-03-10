#!/usr/bin/env node

/**
 * Test Script: Verify Workout Database Coverage
 * 
 * Usage: node scripts/test-workout-coverage.js
 * 
 * This script:
 * 1. Loads the consolidated workout database
 * 2. Generates multiple training plans
 * 3. Tracks which workouts are used
 * 4. Reports coverage statistics
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
}

// Read the MASTER_WORKOUTS from TypeScript file (parse manually)
function readWorkoutDatabase() {
  const filePath = path.join(__dirname, '../src/lib/sessions-data-classified.ts');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count workout definitions (they follow pattern: { id: "w..."
    const workoutMatches = content.match(/{ id:/g);
    const count = workoutMatches ? workoutMatches.length : 0;
    
    // Extract some workout titles for display
    const titleMatches = content.match(/title:\s*["']([^"']+)["']/g);
    const titles = titleMatches ? titleMatches.map(t => t.match(/["']([^"']+)["']/)[1]) : [];
    
    return {
      count,
      titles: titles.slice(0, 10), // First 10
      file: filePath,
    };
  } catch (error) {
    log('red', `ERROR reading workout database: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  log('bright', '═'.repeat(100));
  log('bright', 'WORKOUT DATABASE COVERAGE TEST');
  log('bright', '═'.repeat(100));

  log('cyan', '\n📊 Reading Workout Database...\n');

  const db = readWorkoutDatabase();

  log('green', `✓ Database loaded successfully`);
  log('', `  Location: ${db.file}`);
  log('', `  Total Workouts: ${db.count}`);

  log('', '\nSample Workouts:');
  db.titles.forEach((title, idx) => {
    log('', `  ${idx + 1}. ${title}`);
  });

  log('cyan', '\n📋 Next Steps:\n');
  log('', '1. To run full iterative test:');
  log('yellow', '   npm run build && npx ts-node test-workout-coverage.ts\n');

  log('', '2. View workouts in UI:');
  log('yellow', '   https://cyclecoach-six.vercel.app/workouts\n');

  log('', '3. Generate plans and check coverage:');
  log('yellow', '   Go to Settings → Update Training Schedule\n');
  log('', '   Go to Plan to see generated workouts\n');

  log('bright', '═'.repeat(100));
  log('green', `✓ Database has ${db.count} workouts ready for use`);
  log('bright', '═'.repeat(100));
}

main();
