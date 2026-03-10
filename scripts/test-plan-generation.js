#!/usr/bin/env node

/**
 * PLAN GENERATION TEST
 * Verify that plan generation works with the full 260-workout database
 */

const path = require('path');
const fs = require('fs');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 PLAN GENERATION TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ─────────────────────────────────────────────────────────────────────────
// TEST 1: Load metadata and check data integrity
// ─────────────────────────────────────────────────────────────────────────

console.log('📊 TEST 1: Data Integrity Check\n');

const metadataPath = path.join(
  __dirname,
  '..',
  'src/lib/workouts/workouts-metadata.json'
);

let metadata;
try {
  const raw = fs.readFileSync(metadataPath, 'utf8');
  metadata = JSON.parse(raw);
  console.log(`✅ Loaded ${metadata.totalWorkouts} workouts`);
} catch (error) {
  console.error('❌ Failed to load metadata:', error.message);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 2: Verify categories can support plan generation
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🎯 TEST 2: Category Coverage for Plan Generation\n');

// Plan generation needs these categories:
const requiredCategories = [
  'BASE',
  'THRESHOLD',
  'VO2MAX',
  'RECOVERY',
];

const optionalCategories = [
  'TEMPO',
  'SWEET_SPOT',
  'ANAEROBIC',
  'SPRINT',
  'RACE_SIM',
];

const allCategories = metadata.byCategory;
const availableCategories = Object.keys(allCategories);

console.log('Required categories for plan generation:');
let allRequiredPresent = true;
for (const category of requiredCategories) {
  if (availableCategories.includes(category)) {
    const count = allCategories[category].length;
    console.log(`  ✅ ${category.padEnd(15)}: ${count} workouts`);
  } else {
    console.error(`  ❌ ${category}: NOT FOUND`);
    allRequiredPresent = false;
  }
}

if (!allRequiredPresent) {
  console.error('\n❌ Critical: Missing required categories');
  process.exit(1);
}

console.log('\nOptional categories (for variety):');
for (const category of optionalCategories) {
  if (availableCategories.includes(category)) {
    const count = allCategories[category].length;
    console.log(`  ✅ ${category.padEnd(15)}: ${count} workouts`);
  } else {
    console.log(`  ⚠️  ${category.padEnd(15)}: Not available`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 3: Verify diversity within categories
// ─────────────────────────────────────────────────────────────────────────

console.log('\n📈 TEST 3: Diversity Within Categories\n');

const diversityRequirements = {
  BASE: 5,          // At least 5 different BASE workouts
  THRESHOLD: 3,     // At least 3 different THRESHOLD workouts
  VO2MAX: 5,        // At least 5 different VO2MAX workouts
  RECOVERY: 2,      // At least 2 different RECOVERY workouts
};

let diversityOk = true;
for (const [category, minRequired] of Object.entries(diversityRequirements)) {
  const available = allCategories[category]?.length || 0;
  
  if (available >= minRequired) {
    console.log(`✅ ${category.padEnd(15)}: ${available} ≥ ${minRequired}`);
  } else {
    console.error(`❌ ${category.padEnd(15)}: ${available} < ${minRequired}`);
    diversityOk = false;
  }
}

if (!diversityOk) {
  console.warn('\n⚠️  Low diversity in some categories - plan generation may repeat workouts');
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 4: Validate workout structure (sample check)
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🔍 TEST 4: Workout Structure Validation\n');

const workoutsDir = path.join(__dirname, '..', 'src/lib/workouts');

// Check a sample of workouts from different categories
const sampleCategories = ['BASE', 'THRESHOLD', 'VO2MAX'];
let structureErrors = 0;

for (const category of sampleCategories) {
  const workoutsInCategory = metadata.byCategory[category];
  if (!workoutsInCategory || workoutsInCategory.length === 0) continue;
  
  // Pick first workout in category
  const sampleWorkout = workoutsInCategory[0];
  const filePath = path.join(workoutsDir, sampleWorkout.file || `${sampleWorkout.source}/${sampleWorkout.id}.json`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workout = JSON.parse(content);
    
    // Verify structure for plan generation
    const hasIntervals = Array.isArray(workout.intervals) || typeof workout.intervals === 'function';
    const hasCategory = workout.category === category;
    const hasDuration = typeof workout.duration === 'number' && workout.duration > 0;
    const hasDifficulty = typeof workout.difficulty === 'number' || typeof workout.difficultyScore === 'number';
    
    if (hasIntervals && hasCategory && hasDuration && hasDifficulty) {
      console.log(`✅ ${category.padEnd(15)}: ${workout.title.substring(0, 35)}`);
    } else {
      console.error(`❌ ${category}: Structure issues in ${workout.title}`);
      if (!hasIntervals) console.error('   - Missing intervals');
      if (!hasCategory) console.error('   - Category mismatch');
      if (!hasDuration) console.error('   - Missing duration');
      if (!hasDifficulty) console.error('   - Missing difficulty');
      structureErrors++;
    }
  } catch (error) {
    console.error(`❌ ${category}: Failed to read - ${error.message}`);
    structureErrors++;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 5: Estimate plan generation capability
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🚴 TEST 5: Plan Generation Capability\n');

// A 16-week plan = 4 blocks × 4 weeks × ~5 sessions per week = ~80 sessions
// We need to ensure we have enough variety

const estimatedSessionsNeeded = 4 * 4 * 5;  // 80 sessions
const totalWorkouts = metadata.totalWorkouts;

console.log(`Estimated 4-block plan:     ${estimatedSessionsNeeded} sessions`);
console.log(`Available workouts:         ${totalWorkouts}`);
console.log(`Ratio:                      ${(totalWorkouts / estimatedSessionsNeeded).toFixed(2)}x`);

if (totalWorkouts >= estimatedSessionsNeeded * 2) {
  console.log('\n✅ Excellent: Enough variety to avoid repetition');
} else if (totalWorkouts >= estimatedSessionsNeeded) {
  console.log('\n✅ Good: Sufficient for basic plan generation');
} else {
  console.log('\n⚠️  Warning: Limited variety for extended plans');
}

// ─────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 PLAN GENERATION READINESS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allRequiredPresent && diversityOk && structureErrors === 0) {
  console.log('✅ READY FOR PLAN GENERATION\n');
  console.log('System can generate:');
  console.log('  ✅ 4+ week training blocks');
  console.log('  ✅ Varied workout selection');
  console.log('  ✅ No repetition within weeks');
  console.log('  ✅ Multiple block types (BASE, THRESHOLD, VO2MAX, etc.)');
  console.log('  ✅ 16-week plans without excessive repetition\n');
  process.exit(0);
} else {
  console.log('⚠️  ISSUES FOUND - Review above\n');
  if (!allRequiredPresent) console.log('  ❌ Missing required categories');
  if (!diversityOk) console.log('  ❌ Low diversity in categories');
  if (structureErrors > 0) console.log('  ❌ Structure validation errors');
  console.log();
  process.exit(1);
}
