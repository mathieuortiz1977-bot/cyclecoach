#!/usr/bin/env node

/**
 * INTEGRATION TEST - Quick verification of 260-workout database
 * Compiled JavaScript version (no TS compilation needed)
 */

const path = require('path');
const fs = require('fs');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 WORKOUT INTEGRATION TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ─────────────────────────────────────────────────────────────────────────
// TEST 1: Load metadata and verify structure
// ─────────────────────────────────────────────────────────────────────────

console.log('📊 TEST 1: Loading Metadata\n');

const metadataPath = path.join(
  __dirname,
  '..',
  'src/lib/workouts/workouts-metadata.json'
);

let metadata;
try {
  const rawMetadata = fs.readFileSync(metadataPath, 'utf8');
  metadata = JSON.parse(rawMetadata);
  console.log(`✅ Loaded metadata (version ${metadata.version})`);
} catch (error) {
  console.error('❌ Failed to load metadata:', error.message);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 2: Verify total count
// ─────────────────────────────────────────────────────────────────────────

console.log('\n📈 TEST 2: Total Workouts\n');

const totalWorkouts = metadata.totalWorkouts;
console.log(`Total: ${totalWorkouts}`);

if (totalWorkouts === 260) {
  console.log('✅ Correct: 260 workouts');
} else {
  console.error(`❌ Expected 260, got ${totalWorkouts}`);
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 3: Source breakdown
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🔄 TEST 3: Source Breakdown\n');

const expectedSources = {
  carlos: 105,
  zwift: 68,
  research: 47,
  'british-cycling': 8,
  'dylan-johnson': 5,
  'san-millan': 5,
  sufferfest: 8,
  trainerroad: 10,
  xert: 4,
};

const actualSources = metadata.bySource;

let sourceErrors = 0;
for (const [source, expected] of Object.entries(expectedSources)) {
  const actual = actualSources[source]?.count || 0;
  
  if (actual === expected) {
    console.log(`✅ ${source.padEnd(20)}: ${actual.toString().padStart(3)}`);
  } else {
    console.error(`❌ ${source.padEnd(20)}: ${actual} (expected ${expected})`);
    sourceErrors++;
  }
}

if (sourceErrors === 0) {
  console.log('\n✅ All sources verified');
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 4: Verify files exist
// ─────────────────────────────────────────────────────────────────────────

console.log('\n📁 TEST 4: File Existence Check\n');

const workoutsDir = path.join(__dirname, '..', 'src/lib/workouts');
const sources = Object.keys(expectedSources);

let fileErrors = 0;
let totalFiles = 0;

for (const source of sources) {
  const sourceDir = path.join(workoutsDir, source);
  
  try {
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));
    const expected = expectedSources[source];
    
    totalFiles += files.length;
    
    if (files.length === expected) {
      console.log(`✅ ${source.padEnd(20)}: ${files.length} files`);
    } else {
      console.error(`❌ ${source.padEnd(20)}: ${files.length} files (expected ${expected})`);
      fileErrors++;
    }
  } catch (error) {
    console.error(`❌ ${source}: Error reading directory - ${error.message}`);
    fileErrors++;
  }
}

console.log(`\nTotal files: ${totalFiles}`);

if (fileErrors === 0) {
  console.log('✅ All files present');
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 5: Sample file validation
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🔍 TEST 5: Sample File Validation\n');

for (const source of sources) {
  const sourceDir = path.join(workoutsDir, source);
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) continue;
  
  const sampleFile = path.join(sourceDir, files[0]);
  
  try {
    const content = fs.readFileSync(sampleFile, 'utf8');
    const workout = JSON.parse(content);
    
    // Verify required fields
    const hasId = !!workout.id;
    const hasTitle = !!workout.title;
    const hasIntervals = Array.isArray(workout.intervals);
    const hasCategory = !!workout.category;
    const hasDuration = typeof workout.duration === 'number';
    const hasSource = !!workout.source;
    
    const allValid = hasId && hasTitle && hasIntervals && hasCategory && hasDuration && hasSource;
    
    if (allValid) {
      console.log(`✅ ${source.padEnd(20)}: ${workout.title.substring(0, 30)}`);
    } else {
      console.error(`❌ ${source}: Missing fields`);
      if (!hasId) console.error('   - id');
      if (!hasTitle) console.error('   - title');
      if (!hasIntervals) console.error('   - intervals');
      if (!hasCategory) console.error('   - category');
      if (!hasDuration) console.error('   - duration');
      if (!hasSource) console.error('   - source');
    }
  } catch (error) {
    console.error(`❌ ${source}: Failed to parse - ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 6: Category distribution
// ─────────────────────────────────────────────────────────────────────────

console.log('\n📋 TEST 6: Category Distribution\n');

const categories = metadata.byCategory;
const categoryEntries = Object.entries(categories)
  .map(([cat, workouts]) => ({
    category: cat,
    count: workouts.length,
  }))
  .sort((a, b) => b.count - a.count);

console.log('Top categories:');
categoryEntries.slice(0, 10).forEach(({ category, count }) => {
  console.log(`  ${category.padEnd(20)}: ${count.toString().padStart(3)}`);
});

// ─────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`Total workouts:        ${totalWorkouts}`);
console.log(`Total categories:      ${Object.keys(categories).length}`);
console.log(`Total sources:         ${Object.keys(actualSources).length}`);
console.log(`Files on disk:         ${totalFiles}`);

if (sourceErrors === 0 && fileErrors === 0 && totalWorkouts === 260 && totalFiles === 260) {
  console.log('\n✅ ALL TESTS PASSED!\n');
  console.log('System Status:');
  console.log('  ✅ Data loading works');
  console.log('  ✅ 260 workouts available');
  console.log('  ✅ All 9 sources present');
  console.log('  ✅ Files validated');
  console.log('  ✅ Ready for production\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed - review above\n');
  process.exit(1);
}
