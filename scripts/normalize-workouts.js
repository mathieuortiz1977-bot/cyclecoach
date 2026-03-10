#!/usr/bin/env node
/**
 * COMPREHENSIVE WORKOUT NORMALIZER (JavaScript version)
 * 
 * Converts Carlos's 105 workouts into unified normalized structure
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 STARTING COMPREHENSIVE WORKOUT NORMALIZATION\n');

let allWorkouts = [];
let processedCount = 0;
let errorCount = 0;

// PHASE 1: Load and convert Carlos's 105 workouts
console.log('📚 PHASE 1: Processing Carlos\'s 105 workouts...');

try {
  const carlosPath = path.join(__dirname, '../src/lib/carlos-105-workouts.json');
  const carlosRaw = JSON.parse(fs.readFileSync(carlosPath, 'utf-8'));

  for (const carlos of carlosRaw) {
    try {
      const category = categorizeWorkout(carlos.title, carlos.goal || '');
      const duration = parseInt(carlos.duration) || 60;
      const powerHigh = extractMaxPower(carlos.structure);

      // Create simple interval from description
      const intervals = [{
        name: 'Complete Workout',
        zone: getPrimaryZone(category),
        powerLow: Math.max(40, powerHigh - 30),
        powerHigh: powerHigh,
        durationSecs: duration * 60,
        purpose: carlos.goal || 'Training',
        coachingNotes: generateCoachingNotes('Complete Workout', getPrimaryZone(category), Math.max(40, powerHigh - 30), powerHigh)
      }];

      const normalized = {
        id: `carlos_${carlos.id.toLowerCase()}`,
        title: carlos.title,
        category: category,
        primaryZone: getPrimaryZone(category),
        structure: 'mixed',
        duration: duration,
        scalable: true,
        difficultyScore: estimateDifficulty(category, powerHigh),
        tss: parseInt(carlos.tss) || 60,
        description: carlos.goal || '',
        purpose: carlos.goal || '',
        source: 'carlos',
        intervals: intervals
      };

      allWorkouts.push(normalized);
      processedCount++;
    } catch (err) {
      errorCount++;
    }
  }

  console.log(`✅ Processed ${processedCount} Carlos workouts (${errorCount} errors)\n`);
} catch (err) {
  console.error(`❌ Failed to load Carlos workouts: ${err.message}`);
}

/**
 * Auto-categorize workout
 */
function categorizeWorkout(title, description) {
  const combined = `${title} ${description}`.toLowerCase();

  if (combined.includes('recovery') || combined.includes('easy')) return 'RECOVERY';
  if (combined.includes('base') || combined.includes('endurance')) return 'BASE';
  if (combined.includes('strength') || combined.includes('force')) return 'STRENGTH';
  if (combined.includes('technique') || combined.includes('pedal') || combined.includes('drill')) return 'TECHNIQUE';
  if (combined.includes('tempo')) return 'TEMPO';
  if (combined.includes('sweet spot') || combined.includes('ss')) return 'SWEET_SPOT';
  if (combined.includes('threshold') || combined.includes('ftp')) return 'THRESHOLD';
  if (combined.includes('vo2') || combined.includes('aerobic')) return 'VO2MAX';
  if (combined.includes('anaerobic')) return 'ANAEROBIC';
  if (combined.includes('sprint')) return 'SPRINT';
  if (combined.includes('test') || combined.includes('ramp')) return 'FTP_TEST';
  if (combined.includes('race') || combined.includes('simulation')) return 'RACE_SIM';

  return 'MIXED';
}

/**
 * Extract max power from description
 */
function extractMaxPower(description) {
  const match = description.match(/(\d+)%\s*FTP/);
  if (match) return parseInt(match[1]);
  return 75; // default
}

/**
 * Get primary zone for category
 */
function getPrimaryZone(category) {
  const zoneMap = {
    'RECOVERY': 'Z1',
    'BASE': 'Z2',
    'TECHNIQUE': 'Z2',
    'STRENGTH': 'Z2-Z3',
    'TEMPO': 'Z3',
    'SWEET_SPOT': 'Z3',
    'THRESHOLD': 'Z4',
    'VO2MAX': 'Z5',
    'ANAEROBIC': 'Z5-Z6',
    'SPRINT': 'Z6',
    'FTP_TEST': 'Z4',
    'RACE_SIM': 'Z4-Z6',
    'MIXED': 'Z2-Z5',
  };
  return zoneMap[category] || 'Z2';
}

/**
 * Generate coaching notes
 */
function generateCoachingNotes(name, zone, powerLow, powerHigh) {
  const lower = name.toLowerCase();
  let template;

  if (lower.includes('warm')) template = 'warmup';
  else if (lower.includes('cool')) template = 'cooldown';
  else if (lower.includes('recovery') || lower.includes('rest')) template = 'recovery';
  else if (powerHigh >= 115) template = 'vo2';
  else if (powerHigh >= 95) template = 'threshold';
  else if (lower.includes('sprint')) template = 'sprint';
  else template = 'threshold';

  const templates = {
    'warmup': {
      DARK_HUMOR: 'Your legs are waking up. Enjoy these easy minutes while they last.',
      MOTIVATIONAL: 'Start easy and build gradually. You\'re preparing for something special.',
      TECHNICAL: 'Progressive warm-up elevating core temperature and muscle activation.',
      MIXED: 'Take your time here. Smooth breathing, easy cadence. Get ready.'
    },
    'cooldown': {
      DARK_HUMOR: 'You made it. Spin easy and let your lungs remember what breathing feels like.',
      MOTIVATIONAL: 'Excellent work! You just did serious training. Recover well.',
      TECHNICAL: 'Low-intensity spinning promoting lactate clearance and recovery.',
      MIXED: 'Easy recovery. Your workout is done. Breathe easy and adapt.'
    },
    'recovery': {
      DARK_HUMOR: 'Easy spinning, light breathing, zero suffering. Your legs earned this.',
      MOTIVATIONAL: 'You\'re giving your body exactly what it needs to bounce back stronger.',
      TECHNICAL: 'Low-intensity promotes parasympathetic activation and lactate clearance.',
      MIXED: 'Dial it way back. This is about listening to your body.'
    },
    'threshold': {
      DARK_HUMOR: 'Welcome to FTP. This is your redline — it hurts, and that\'s the point.',
      MOTIVATIONAL: 'This is where you get faster. Every interval raises your ceiling.',
      TECHNICAL: 'FTP-level work maximally stimulates neuromuscular recruitment and power.',
      MIXED: 'Hold this power steady. Your legs will argue — listen but don\'t give in.'
    },
    'vo2': {
      DARK_HUMOR: 'Your aerobic system just got a nasty surprise. Embrace the chaos.',
      MOTIVATIONAL: 'You\'re reaching for your aerobic potential. Elite fitness training.',
      TECHNICAL: 'Maximum oxidative stress drives mitochondrial biogenesis.',
      MIXED: 'Keep your cadence high. You\'re building something real here.'
    },
    'sprint': {
      DARK_HUMOR: 'You\'re now riding like someone stole your bike. Maximum everything.',
      MOTIVATIONAL: 'All-out effort. You\'re discovering your power ceiling.',
      TECHNICAL: 'Maximum neuromuscular recruitment generating peak force.',
      MIXED: 'Give it everything. This is your moment.'
    }
  };

  return templates[template] || templates['threshold'];
}

/**
 * Estimate difficulty score
 */
function estimateDifficulty(category, powerHigh) {
  const categoryScore = {
    'RECOVERY': 1,
    'BASE': 2,
    'TECHNIQUE': 3,
    'STRENGTH': 4,
    'TEMPO': 5,
    'SWEET_SPOT': 6,
    'THRESHOLD': 7,
    'ANAEROBIC': 8,
    'VO2MAX': 8,
    'SPRINT': 9,
    'FTP_TEST': 10,
    'RACE_SIM': 8,
    'MIXED': 6,
  };

  let score = categoryScore[category] || 5;
  if (powerHigh >= 130) score = Math.min(10, score + 2);
  else if (powerHigh >= 115) score = Math.min(10, score + 1);

  return score;
}

// SUMMARY
console.log('📊 NORMALIZATION SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Total Workouts Processed: ${allWorkouts.length}`);
console.log(`⚠️  Errors/Skipped: ${errorCount}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Category breakdown
const categoryBreakdown = {};
for (const workout of allWorkouts) {
  categoryBreakdown[workout.category] = (categoryBreakdown[workout.category] || 0) + 1;
}

console.log('\n📈 Breakdown by Category:');
for (const [category, count] of Object.entries(categoryBreakdown)) {
  console.log(`   ${category}: ${count}`);
}

// Output normalized JSON
const outputPath = path.join(__dirname, '../src/lib/workouts-normalized.json');
fs.writeFileSync(outputPath, JSON.stringify(allWorkouts, null, 2));

console.log(`\n✅ NORMALIZATION COMPLETE`);
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Total: ${allWorkouts.length} workouts\n`);
