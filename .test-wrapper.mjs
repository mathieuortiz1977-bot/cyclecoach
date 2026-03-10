
import { generatePlan } from './src/lib/periodization.js';
import { MASTER_WORKOUTS } from './src/lib/sessions-data-classified.js';

const usedWorkoutIds = new Set();
const selectionCount = new Map();
const sessionsByType = { INDOOR: 0, OUTDOOR: 0, REST: 0 };

console.log('Running 10 plan generations...');

for (let planNum = 1; planNum <= 10; planNum++) {
  const plan = generatePlan(
    4,
    ['MON', 'TUE', 'THU', 'FRI', 'SAT', 'SUN'],
    'SAT',
    undefined,
    undefined,
    undefined,
    'test-user-' + planNum,
    true,
    60,
    90
  );

  plan.blocks.forEach(block => {
    block.weeks.forEach(week => {
      week.sessions.forEach(session => {
        sessionsByType[session.sessionType]++;
        if (session.templateId) {
          usedWorkoutIds.add(session.templateId);
          selectionCount.set(
            session.templateId,
            (selectionCount.get(session.templateId) || 0) + 1
          );
        }
      });
    });
  });
}

console.log('\nDatabase size: ' + MASTER_WORKOUTS.length);
console.log('Workouts selected: ' + usedWorkoutIds.size);
console.log('Coverage: ' + (usedWorkoutIds.size / MASTER_WORKOUTS.length * 100).toFixed(1) + '%');

const neverUsed = MASTER_WORKOUTS.filter(w => !usedWorkoutIds.has(w.id));
console.log('\nNever used: ' + neverUsed.length);

if (neverUsed.length > 0 && neverUsed.length <= 30) {
  console.log('\nExamples:');
  neverUsed.forEach(w => {
    console.log('  - ' + w.title + ' (' + w.category + ')');
  });
}

// By category
const byCategory = new Map();
usedWorkoutIds.forEach(id => {
  const w = MASTER_WORKOUTS.find(x => x.id === id);
  if (w) {
    byCategory.set(w.category, (byCategory.get(w.category) || 0) + 1);
  }
});

console.log('\nBy category (selected / total):');
Array.from(byCategory.entries())
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    const total = MASTER_WORKOUTS.filter(w => w.category === cat).length;
    console.log('  ' + cat + ': ' + count + ' / ' + total);
  });

console.log('\n═'.repeat(100));
if (usedWorkoutIds.size >= 160) {
  console.log('✅ EXCELLENT: ' + usedWorkoutIds.size + ' / 175 workouts selected');
} else if (usedWorkoutIds.size >= 140) {
  console.log('✓ GOOD: ' + usedWorkoutIds.size + ' / 175 workouts selected');
} else if (usedWorkoutIds.size >= 100) {
  console.log('⚠️  PARTIAL: ' + usedWorkoutIds.size + ' / 175 workouts selected');
} else if (usedWorkoutIds.size > 70) {
  console.log('❌ BROKEN: ' + usedWorkoutIds.size + ' / 175 workouts selected');
} else {
  console.log('🔴 FAILED: Only ' + usedWorkoutIds.size + ' selected (merge failed)');
}
console.log('═'.repeat(100));
