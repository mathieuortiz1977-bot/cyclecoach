#!/usr/bin/env node

/**
 * RESEARCH WORKOUT COMPLETE NORMALIZATION
 * Extracts all research workouts from TypeScript sources (v1 + v2)
 * Parses interval functions and normalizes to hybrid structure
 */

const fs = require('fs');
const path = require('path');

// Load coaching library
const COACHING_LIBRARY = {
  warmup: {
    DARK_HUMOR: "Your lungs have no idea what's coming. Enjoy these easy minutes while they last.",
    MOTIVATIONAL: "Start easy and build gradually. You're preparing your body for something special.",
    TECHNICAL: "Progressive warm-up elevating core temperature and activating neuromuscular systems.",
    MIXED: "Take your time here. Smooth breathing, easy cadence. Get ready."
  },
  cooldown: {
    DARK_HUMOR: "You survived. Your muscles are screaming, but you did it.",
    MOTIVATIONAL: "Nice work! Spin easy and let your body recover.",
    TECHNICAL: "Easy aerobic recovery spin to facilitate lactate clearance.",
    MIXED: "Bring it down smoothly. You earned this recovery."
  },
  vo2max: {
    DARK_HUMOR: "Supra-maximal efforts. Your lungs will remember every second of this.",
    MOTIVATIONAL: "This is VO2max work. You're pushing your aerobic ceiling higher.",
    TECHNICAL: "Supra-maximal efforts drive maximal oxygen uptake and aerobic capacity.",
    MIXED: "Go hard but controlled. Breathe through the discomfort."
  },
  threshold: {
    DARK_HUMOR: "Welcome to FTP. Where your legs wonder why you hate them so much.",
    MOTIVATIONAL: "This is FTP work - the gold standard for raising your ceiling. Stay strong!",
    TECHNICAL: "Sustained FTP stimulus drives maximal lactate steady-state adaptation.",
    MIXED: "Hold steady power. Even pacing throughout. You've trained for this."
  },
  sweet_spot: {
    DARK_HUMOR: "It's called sweet spot because you're sweet enough to suffer through it.",
    MOTIVATIONAL: "Sweet spot is peak efficiency. Maximum adaptations, manageable fatigue.",
    TECHNICAL: "90-93% FTP optimizes threshold adaptation with lower fatigue accumulation.",
    MIXED: "Maintain rhythm. Not easy, but sustainable. You're in control."
  },
  tempo: {
    DARK_HUMOR: "This is the sweet spot where discomfort meets sustainability. You can do this.",
    MOTIVATIONAL: "This is muscular endurance work. You're getting stronger with every interval.",
    TECHNICAL: "Sustained tempo develops lactate threshold buffering capacity.",
    MIXED: "Steady, controlled effort. Feel the burn but maintain power."
  },
  base_endurance: {
    DARK_HUMOR: "Just go easy and stay comfortable. Your aerobic system will thank you later.",
    MOTIVATIONAL: "Building your aerobic foundation. Consistency is key.",
    TECHNICAL: "Fat oxidation zone - maximize mitochondrial efficiency at low intensity.",
    MIXED: "Keep it easy, maintain steady pace, build aerobic base."
  },
  recovery: {
    DARK_HUMOR: "Easy spinning. Just don't fall asleep.",
    MOTIVATIONAL: "Active recovery enhances blood flow and promotes adaptation.",
    TECHNICAL: "Low-intensity active recovery facilitates lactate clearance.",
    MIXED: "Keep it easy and enjoy the ride."
  },
  anaerobic: {
    DARK_HUMOR: "Your lactate system is about to get a serious wake-up call.",
    MOTIVATIONAL: "This is anaerobic power. You're training your body to sustain intensity.",
    TECHNICAL: "High-intensity anaerobic stimulus drives glycolytic power and lactate tolerance.",
    MIXED: "Explosive effort. Go hard and trust your training."
  },
  sprint: {
    DARK_HUMOR: "Max power. All-out. Your pain receptors are about to get very busy.",
    MOTIVATIONAL: "Peak neuromuscular power. This is where champions are made.",
    TECHNICAL: "Maximal neuromuscular recruitment develops fast-twitch fiber recruitment.",
    MIXED: "Accelerate hard. Max cadence, max power. No holding back."
  }
};

function getCoachingNotes(powerLow, powerHigh = null) {
  const avg = powerHigh ? (powerLow + powerHigh) / 2 : powerLow;
  
  if (avg < 60) return COACHING_LIBRARY.recovery;
  if (avg < 75) return COACHING_LIBRARY.base_endurance;
  if (avg < 88) return COACHING_LIBRARY.tempo;
  if (avg < 95) return COACHING_LIBRARY.sweet_spot;
  if (avg < 106) return COACHING_LIBRARY.threshold;
  if (avg < 120) return COACHING_LIBRARY.vo2max;
  if (avg < 140) return COACHING_LIBRARY.anaerobic;
  return COACHING_LIBRARY.sprint;
}

function mapCategoryToZone(category) {
  const mapping = {
    'VO2MAX': 'Z5',
    'COMBO': 'Z3-Z5',
    'ANAEROBIC': 'Z6',
    'THRESHOLD': 'Z4',
    'SWEET_SPOT': 'Z3',
    'TEMPO': 'Z3',
    'BASE': 'Z2',
    'RECOVERY': 'Z1',
    'TECHNIQUE': 'Z2-Z3',
    'STRENGTH': 'Z2-Z3',
    'SPRINT': 'Z6',
    'RACE_SIM': 'Z3-Z6',
    'FTP_TEST': 'Z4-Z6',
    'MIXED': 'Z2-Z5'
  };
  return mapping[category] || 'Z2';
}

// Read both research files
const researchV1Path = '/Users/mathieuortiz/Projects/cyclecoach/src/lib/research-workouts.ts';
const researchV2Path = '/Users/mathieuortiz/Projects/cyclecoach/src/lib/research-workouts-v2.ts';

const researchV1Source = fs.readFileSync(researchV1Path, 'utf8');
const researchV2Source = fs.readFileSync(researchV2Path, 'utf8');

// Extract workouts from both files
function extractWorkouts(source, version) {
  const workouts = [];
  
  const workoutMatches = source.matchAll(/\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*'([^']+)',\s*category:\s*'([^']+)',\s*duration:\s*(\d+),\s*zone:\s*'([^']+)',\s*purpose:\s*'([^']+)',\s*intervals:\s*\(\)\s*=>\s*\[([\s\S]*?)\],\s*protocol:\s*'([^']+)',\s*researcher:\s*'([^']+)',\s*structure:\s*'([^']+)',\s*difficultyScore:\s*(\d+),?\s*\}/g);
  
  for (const match of workoutMatches) {
    const [, id, title, description, category, duration, zone, purpose, intervalsStr, protocol, researcher, structure, difficulty] = match;
    
    workouts.push({
      id: id.toLowerCase(),
      title,
      description,
      category,
      duration: parseInt(duration),
      zone,
      purpose,
      intervalsStr,
      protocol,
      researcher,
      structure,
      difficultyScore: parseInt(difficulty),
      version
    });
  }
  
  return workouts;
}

const workoutsV1 = extractWorkouts(researchV1Source, 'v1');
const workoutsV2 = extractWorkouts(researchV2Source, 'v2');
const allWorkouts = [...workoutsV1, ...workoutsV2];

console.log(`\n🚀 EXTRACTING ${allWorkouts.length} RESEARCH WORKOUTS\n`);
console.log(`   V1: ${workoutsV1.length}\n`);
console.log(`   V2: ${workoutsV2.length}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Parse intervals
function parseIntervals(intervalsStr, totalDuration) {
  const intervals = [];
  const totalSecs = totalDuration * 60;
  
  // Match each interval: { name: '...', durationPercent: N, powerLow: N, powerHigh: N, ... }
  const intervalMatches = intervalsStr.matchAll(/\{\s*name:\s*'([^']+)',\s*durationPercent:\s*(\d+(?:\.\d+)?),\s*powerLow:\s*(\d+),\s*powerHigh:\s*(\d+),\s*zone:\s*'([^']+)',\s*rpe:\s*(\d+),\s*purpose:\s*'([^']+)',\s*coachNote:\s*'([^']+)'\s*[,}]/g);
  
  for (const match of intervalMatches) {
    const [, name, durationPercent, powerLow, powerHigh, zone, rpe, purpose, coachNote] = match;
    const durationSecs = (parseFloat(durationPercent) / 100) * totalSecs;
    
    intervals.push({
      name,
      durationPercent: parseFloat(durationPercent),
      durationSecs: Math.round(durationSecs),
      powerLow: parseInt(powerLow),
      powerHigh: parseInt(powerHigh),
      zone,
      rpe: parseInt(rpe),
      purpose,
      coachNote
    });
  }
  
  return intervals;
}

// Normalize research workout
function normalizeResearchWorkout(workout) {
  const parsedIntervals = parseIntervals(workout.intervalsStr, workout.duration);
  
  const normalized = {
    id: workout.id,
    title: workout.title,
    source: `research-${workout.version}`,
    category: workout.category,
    primaryZone: mapCategoryToZone(workout.category),
    structure: workout.structure,
    difficulty: workout.difficultyScore,
    duration: workout.duration,
    scalable: true,
    tss: Math.round(workout.difficultyScore * (workout.duration / 60) * 1.2),
    description: workout.description,
    purpose: workout.purpose,
    protocol: workout.protocol,
    researcher: workout.researcher,
    intervals: []
  };

  // Convert parsed intervals
  for (const interval of parsedIntervals) {
    const baseInterval = {
      name: interval.name,
      purpose: interval.purpose,
      phase: interval.name.toLowerCase().includes('warm') ? 'warmup' :
             interval.name.toLowerCase().includes('cool') ? 'cooldown' : 'work',
      duration: {
        percent: interval.durationPercent,
        absoluteSecs: interval.durationSecs
      },
      intensity: {
        zone: interval.zone,
        powerLow: interval.powerLow,
        powerHigh: interval.powerHigh,
        cadenceLow: interval.zone === 'Z6' ? 95 : 85,
        cadenceHigh: interval.zone === 'Z6' ? 110 : 100,
        rpe: interval.rpe
      },
      instruction: `${interval.name} at ${interval.powerLow}-${interval.powerHigh}% FTP`,
      coachingNotes: getCoachingNotes(interval.powerLow, interval.powerHigh)
    };

    normalized.intervals.push(baseInterval);
  }

  return normalized;
}

// Generate files
const baseDir = '/Users/mathieuortiz/Projects/cyclecoach/src/lib/workouts';
let researchCount = 0;
const errors = [];

for (const workout of allWorkouts) {
  try {
    const normalized = normalizeResearchWorkout(workout);
    
    // Validate intervals
    if (normalized.intervals.length === 0) {
      errors.push(`${normalized.id}: No intervals parsed`);
      continue;
    }
    
    const filePath = path.join(baseDir, `research/${normalized.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2));
    
    researchCount++;
    if (researchCount % 10 === 0) {
      process.stdout.write(`  ✓ ${researchCount}/${allWorkouts.length}\r`);
    }
  } catch (error) {
    errors.push(`${workout.id}: ${error.message}`);
  }
}

console.log(`\n✅ Research workouts generated: ${researchCount}/${allWorkouts.length}\n`);

if (errors.length > 0) {
  console.log(`⚠️  Errors encountered:\n`);
  errors.forEach(err => console.log(`   ${err}`));
  console.log();
}

// Update metadata
const metadataPath = path.join(baseDir, 'workouts-metadata.json');
if (fs.existsSync(metadataPath)) {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  // Add research files to metadata
  const researchFiles = fs.readdirSync(path.join(baseDir, 'research')).filter(f => f.endsWith('.json'));
  metadata.bySource.research = {
    count: researchCount,
    files: researchFiles.map(f => `research/${f}`)
  };
  
  // Update total
  metadata.totalWorkouts = 105 + 68 + researchCount;
  metadata.generatedAt = new Date().toISOString();
  
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📁 FILES GENERATED:');
console.log(`   Research: ${researchCount} files → ${baseDir}/research/`);
console.log(`   Updated metadata: ${metadataPath}\n`);
console.log('📈 FINAL PROGRESS:');
console.log(`   ✅ PHASE 1: Carlos (105/105)\n`);
console.log(`   ✅ PHASE 2: Zwift (68/68)\n`);
console.log(`   ✅ PHASE 3: Research (${researchCount}/${allWorkouts.length})\n`);
console.log(`   🎉 TOTAL: ${105 + 68 + researchCount} WORKOUTS\n`);
