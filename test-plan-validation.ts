/**
 * COMPREHENSIVE TEST SUITE: Plan Generation Validation
 * 
 * Tests for:
 * 1. Duration accuracy (user selection respected)
 * 2. Training day selection (no missing/extra days)
 * 3. Sunday generation (when selected)
 * 4. Time scaling calculations
 * 5. Complete week structure
 */

import { generatePlan } from './src/lib/periodization';

console.log('='.repeat(80));
console.log('PLAN GENERATION VALIDATION TESTS');
console.log('='.repeat(80));

// Test Case 1: User's Exact Configuration
console.log('\n📋 TEST 1: User Configuration');
console.log('Training days: MON, TUE, THU, FRI, SAT, SUN (6 days)');
console.log('Outdoor day: SAT');
console.log('Indoor duration: 60 min');
console.log('Sunday duration: 90 min');
console.log('-'.repeat(80));

const trainingDays = ['MON', 'TUE', 'THU', 'FRI', 'SAT', 'SUN'] as any;
const plan = generatePlan(
  4,              // numBlocks
  trainingDays,   // User's selected training days
  'SAT',          // Outdoor day
  undefined,
  undefined,
  undefined,
  undefined,
  true,
  60,             // targetDurationMinutes (indoor)
  90              // targetSundayDurationMinutes
);

// Analyze Week 1
const block1 = plan.blocks[0];
const week1 = block1.weeks[0];

console.log('\n✓ WEEK 1 (BUILD) SESSIONS:');
console.log('-'.repeat(80));

const expectedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const foundDays = new Set<string>();

week1.sessions.forEach((session, idx) => {
  const day = session.dayOfWeek;
  foundDays.add(day);
  
  const isSelected = trainingDays.includes(day);
  const isOutdoor = day === 'SAT';
  const isSunday = day === 'SUN';
  
  let expectedDuration = 0;
  if (!isSelected) {
    expectedDuration = 0; // Rest day
  } else if (isOutdoor) {
    expectedDuration = 300; // Outdoor (route-based)
  } else if (isSunday) {
    expectedDuration = 90; // Sunday's separate selection
  } else {
    expectedDuration = 60; // Regular indoor
  }
  
  const actualDuration = session.duration;
  const matches = actualDuration === expectedDuration || 
                  (isOutdoor && actualDuration > 100) || // Allow flexibility for route-based
                  (isSunday && Math.abs(actualDuration - 90) <= 3); // Allow ±3 min scaling variance
  
  const status = matches ? '✅' : '❌';
  const typeLabel = isSelected 
    ? (isOutdoor ? '🌄 OUTDOOR' : (isSunday ? '🚴 SUN' : '🏠 INDOOR'))
    : '😴 REST';
  
  console.log(`${day.padEnd(3)} | ${typeLabel.padEnd(12)} | ${status} Expected: ${expectedDuration}m, Got: ${actualDuration}m`);
});

console.log('\n' + '='.repeat(80));
console.log('VALIDATION RESULTS:');
console.log('='.repeat(80));

// Check 1: All selected days present
const missingDays = trainingDays.filter((d: string) => !foundDays.has(d));
console.log(`\n1. Training days present:`);
if (missingDays.length === 0) {
  console.log('   ✅ All selected days found');
} else {
  console.log(`   ❌ MISSING DAYS: ${missingDays.join(', ')}`);
}

// Check 2: Sunday has workout (not rest)
const sundaySession = week1.sessions.find(s => s.dayOfWeek === 'SUN');
console.log(`\n2. Sunday workout:`);
if (sundaySession && sundaySession.duration > 0) {
  console.log(`   ✅ Sunday has workout (${sundaySession.duration} min)`);
} else {
  console.log(`   ❌ SUNDAY IS REST DAY (should be ${90} min)`);
}

// Check 3: Duration accuracy
const durationCheck = week1.sessions.map(s => {
  if (!trainingDays.includes(s.dayOfWeek)) return null; // Skip rest days
  
  if (s.dayOfWeek === 'SAT') {
    return { day: s.dayOfWeek, target: 'outdoor', actual: s.duration, ok: s.duration > 100 };
  } else if (s.dayOfWeek === 'SUN') {
    return { day: s.dayOfWeek, target: 90, actual: s.duration, ok: Math.abs(s.duration - 90) <= 3 };
  } else {
    return { day: s.dayOfWeek, target: 60, actual: s.duration, ok: s.duration === 60 };
  }
}).filter(Boolean);

console.log(`\n3. Duration accuracy (excluding outdoor routes):`);
const durationsCorrect = durationCheck.filter(d => d!.ok);
const durationsWrong = durationCheck.filter(d => !d!.ok);

if (durationsCorrect.length === durationCheck.length) {
  console.log(`   ✅ All durations correct (${durationCheck.length}/${durationCheck.length})`);
} else {
  console.log(`   ❌ DURATION ERRORS (${durationsWrong.length}/${durationCheck.length}):`);
  durationsWrong.forEach(d => {
    console.log(`      ${d!.day}: expected ${d!.target}m, got ${d!.actual}m`);
  });
}

// Check 4: Monday consistency across weeks
console.log(`\n4. Monday consistency (should be 60m across BUILD week):`);
const mondays = plan.blocks[0].weeks.map((w, idx) => ({
  week: idx + 1,
  day: w.sessions.find(s => s.dayOfWeek === 'MON'),
}));

const mondaysCorrect = mondays.filter(m => m.day && m.day.duration === 60);
if (mondaysCorrect.length === mondays.length) {
  console.log(`   ✅ All Mondays are 60m`);
} else {
  console.log(`   ❌ MONDAY INCONSISTENCY:`);
  mondays.forEach(m => {
    const status = m.day && m.day.duration === 60 ? '✅' : '❌';
    console.log(`      Week ${m.week}: ${status} ${m.day?.duration}m`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const hasErrors = missingDays.length > 0 || 
                  !sundaySession || 
                  sundaySession.duration === 0 ||
                  durationsWrong.length > 0 ||
                  mondaysCorrect.length !== mondays.length;

if (!hasErrors) {
  console.log('✅ ALL TESTS PASSED - Plan generation is correct!');
} else {
  console.log('❌ TESTS FAILED - Critical issues detected:');
  if (missingDays.length > 0) {
    console.log(`   - Missing training days: ${missingDays.join(', ')}`);
  }
  if (!sundaySession || sundaySession.duration === 0) {
    console.log(`   - Sunday not being generated as workout`);
  }
  if (durationsWrong.length > 0) {
    console.log(`   - Duration calculation errors (${durationsWrong.length} sessions)`);
  }
}

console.log('='.repeat(80));
