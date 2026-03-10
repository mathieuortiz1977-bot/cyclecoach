#!/usr/bin/env node

/**
 * ZWIFT WORKOUT COMPLETE NORMALIZATION
 * Extracts all 68 Zwift workouts from TypeScript source
 * Parses interval functions and normalizes to hybrid structure
 */

const fs = require('fs');
const path = require('path');

// Load coaching library (same as Carlos)
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

// Read and parse Zwift workouts from TypeScript
const zwiftSourcePath = '/Users/mathieuortiz/Projects/cyclecoach/src/lib/zwift-workouts.ts';
const zwiftSource = fs.readFileSync(zwiftSourcePath, 'utf8');

// Extract workout objects using regex
const workoutMatches = zwiftSource.matchAll(/\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*category:\s*'([^']+)',\s*description:\s*'([^']+)',\s*purpose:\s*'([^']+)',\s*zone:\s*'([^']+)',\s*duration:\s*(\d+),\s*difficultyScore:\s*(\d+),\s*intervals:\s*\(\)\s*=>\s*\[([\s\S]*?)\],\s*protocol:\s*'([^']+)',\s*researcher:\s*'([^']+)',\s*structure:\s*'([^']+)',?\s*\}/g);

const workouts = [];
for (const match of workoutMatches) {
  const [, id, title, category, description, purpose, zone, duration, difficulty, intervalsStr, protocol, researcher, structure] = match;
  
  workouts.push({
    id: id.toLowerCase(),
    title,
    category,
    description,
    purpose,
    zone,
    duration: parseInt(duration),
    difficultyScore: parseInt(difficulty),
    intervalsStr,
    protocol,
    researcher,
    structure
  });
}

console.log(`\n🚀 EXTRACTING ${workouts.length} ZWIFT WORKOUTS\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Parse intervals from string
function parseIntervals(intervalsStr, totalDuration) {
  const intervals = [];
  const totalSecs = totalDuration * 60;
  
  // Match each interval object: { name: '...', durationPercent: N, ... }
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

// Normalize Zwift workout
function normalizeZwiftWorkout(workout) {
  const parsedIntervals = parseIntervals(workout.intervalsStr, workout.duration);
  
  const normalized = {
    id: workout.id,
    title: workout.title,
    source: 'zwift',
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

  // Convert parsed intervals to normalized structure
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
const metadata = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  totalWorkouts: 0,
  byCategory: {},
  bySource: {
    carlos: { count: 105, files: [] },
    zwift: { count: 0, files: [] },
    research: { count: 0, files: [] }
  },
  all: []
};

let zwiftCount = 0;
const errors = [];

for (const workout of workouts) {
  try {
    const normalized = normalizeZwiftWorkout(workout);
    
    // Validate we have intervals
    if (normalized.intervals.length === 0) {
      errors.push(`${normalized.id}: No intervals parsed`);
      continue;
    }
    
    const filePath = path.join(baseDir, `zwift/${normalized.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2));
    
    // Track metadata
    const category = normalized.category || 'MIXED';
    if (!metadata.byCategory[category]) {
      metadata.byCategory[category] = [];
    }
    metadata.byCategory[category].push({
      id: normalized.id,
      title: normalized.title,
      source: 'zwift',
      difficulty: normalized.difficulty
    });
    
    metadata.bySource.zwift.files.push(`zwift/${normalized.id}.json`);
    metadata.all.push({
      id: normalized.id,
      title: normalized.title,
      category: category,
      source: 'zwift',
      file: `zwift/${normalized.id}.json`,
      difficulty: normalized.difficulty
    });
    
    zwiftCount++;
    if (zwiftCount % 10 === 0) {
      process.stdout.write(`  ✓ ${zwiftCount}/${workouts.length}\r`);
    }
  } catch (error) {
    errors.push(`${workout.id}: ${error.message}`);
  }
}

console.log(`\n✅ Zwift workouts generated: ${zwiftCount}/${workouts.length}\n`);

if (errors.length > 0) {
  console.log(`⚠️  Errors encountered:\n`);
  errors.forEach(err => console.log(`   ${err}`));
  console.log();
}

// Update metadata
metadata.bySource.zwift.count = zwiftCount;
metadata.totalWorkouts = 105 + zwiftCount; // Carlos + Zwift (Research TBD)

// Merge with existing Carlos metadata if exists
const metadataPath = path.join(baseDir, 'workouts-metadata.json');
if (fs.existsSync(metadataPath)) {
  const existing = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  // Merge Zwift into existing
  if (existing.byCategory) {
    for (const [category, items] of Object.entries(metadata.byCategory)) {
      if (existing.byCategory[category]) {
        existing.byCategory[category].push(...items);
      } else {
        existing.byCategory[category] = items;
      }
    }
  }
  
  // Merge source data
  existing.bySource.zwift = metadata.bySource.zwift;
  existing.all.push(...metadata.all);
  existing.totalWorkouts = existing.bySource.carlos.count + zwiftCount;
  existing.generatedAt = new Date().toISOString();
  
  fs.writeFileSync(metadataPath, JSON.stringify(existing, null, 2));
} else {
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📁 FILES GENERATED:');
console.log(`   Zwift: ${zwiftCount} files → ${baseDir}/zwift/`);
console.log(`   Updated metadata: ${metadataPath}\n`);
console.log('📈 PROGRESS:');
console.log(`   ✅ PHASE 1: Carlos (105/105)\n`);
console.log(`   ✅ PHASE 2: Zwift (${zwiftCount}/68)\n`);
console.log(`   ⏳ PHASE 3: Research (0/?)\n`);
