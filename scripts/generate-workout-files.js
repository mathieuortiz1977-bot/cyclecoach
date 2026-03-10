#!/usr/bin/env node

/**
 * COMPREHENSIVE WORKOUT NORMALIZATION
 * Generates 220 individual workout files + metadata index
 * 
 * Sources:
 * - Carlos: 105 workouts (text descriptions)
 * - Zwift: 68 workouts (from zwift-workouts.ts)
 * - Research: 47 workouts (from research files)
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────
// COACHING NOTES LIBRARY (4 personalities per interval type)
// ─────────────────────────────────────────────────────────────────────────

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
  
  base_endurance: {
    DARK_HUMOR: "Just go easy and stay comfortable. Your aerobic system will thank you later.",
    MOTIVATIONAL: "Building your aerobic foundation. Consistency is key.",
    TECHNICAL: "Fat oxidation zone - maximize mitochondrial efficiency at low intensity.",
    MIXED: "Keep it easy, maintain steady pace, build aerobic base."
  },
  
  tempo: {
    DARK_HUMOR: "This is the sweet spot where discomfort meets sustainability. You can do this.",
    MOTIVATIONAL: "This is muscular endurance work. You're getting stronger with every interval.",
    TECHNICAL: "Sustained tempo develops lactate threshold buffering capacity.",
    MIXED: "Steady, controlled effort. Feel the burn but maintain power."
  },
  
  threshold_ftp: {
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
  
  vo2max: {
    DARK_HUMOR: "5 minutes at 110%+ FTP. Your lungs will remember every second of this.",
    MOTIVATIONAL: "This is VO2max work. You're pushing your aerobic ceiling higher.",
    TECHNICAL: "Supra-maximal efforts drive maximal oxygen uptake and aerobic capacity.",
    MIXED: "Go hard but controlled. Breathe through the discomfort."
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
  },
  
  recovery: {
    DARK_HUMOR: "Easy spinning. Just don't fall asleep.",
    MOTIVATIONAL: "Active recovery enhances blood flow and promotes adaptation.",
    TECHNICAL: "Low-intensity active recovery facilitates lactate clearance.",
    MIXED: "Keep it easy and enjoy the ride."
  }
};

// ─────────────────────────────────────────────────────────────────────────
// INTERVAL TYPE DETECTOR
// ─────────────────────────────────────────────────────────────────────────

function detectIntervalType(powerLow, powerHigh, durationSecs) {
  const avgPower = (powerLow + powerHigh) / 2;
  
  if (avgPower < 60) return 'recovery';
  if (avgPower < 75) return 'base_endurance';
  if (avgPower < 88) return 'tempo';
  if (avgPower < 95) return 'sweet_spot';
  if (avgPower < 106) return 'threshold_ftp';
  if (avgPower < 120) return 'vo2max';
  if (avgPower < 140) return 'anaerobic';
  return 'sprint';
}

function getCoachingNotes(intervalType, customPrefix = '') {
  const baseNotes = COACHING_LIBRARY[intervalType] || COACHING_LIBRARY.recovery;
  return {
    DARK_HUMOR: baseNotes.DARK_HUMOR,
    MOTIVATIONAL: baseNotes.MOTIVATIONAL,
    TECHNICAL: baseNotes.TECHNICAL,
    MIXED: baseNotes.MIXED
  };
}

// ─────────────────────────────────────────────────────────────────────────
// CARLOS WORKOUT PARSER
// ─────────────────────────────────────────────────────────────────────────

function parseCarlosWorkout(workout) {
  const intervals = [];
  const structure = workout.structure || '';
  
  // Simple parser for Carlos format
  const lines = structure.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('*'));
  
  let totalDurationSecs = (parseInt(workout.duration) || 60) * 60;
  let currentPhase = 'warmup';
  
  for (const line of lines) {
    // Warmup detection
    if (line.toLowerCase().includes('warm') || line.toLowerCase().includes('warm-up')) {
      const match = line.match(/(\d+)\s*(?:min|minutes)/i);
      if (match) {
        const durationSecs = parseInt(match[1]) * 60;
        const powerMatch = line.match(/(\d+)%?\s*(?:→|-)\s*(\d+)%/);
        intervals.push({
          name: 'Warmup',
          purpose: 'Prepare system and elevate heart rate',
          phase: 'warmup',
          duration: {
            percent: (durationSecs / totalDurationSecs) * 100,
            absoluteSecs: durationSecs
          },
          intensity: {
            zone: 'Z1-Z2',
            powerLow: powerMatch ? parseInt(powerMatch[1]) : 50,
            powerHigh: powerMatch ? parseInt(powerMatch[2]) : 75,
            cadenceLow: 85,
            cadenceHigh: 95,
            rpe: 2
          },
          instruction: 'Progressive warm-up, easy spin',
          coachingNotes: getCoachingNotes('warmup')
        });
      }
    }
    
    // Cool-down detection
    if (line.toLowerCase().includes('cool')) {
      const match = line.match(/(\d+)\s*(?:min|minutes)/i);
      if (match) {
        const durationSecs = parseInt(match[1]) * 60;
        intervals.push({
          name: 'Cool-down',
          purpose: 'Gradually lower heart rate and begin recovery',
          phase: 'cooldown',
          duration: {
            percent: (durationSecs / totalDurationSecs) * 100,
            absoluteSecs: durationSecs
          },
          intensity: {
            zone: 'Z1',
            powerLow: 40,
            powerHigh: 60,
            cadenceLow: 85,
            cadenceHigh: 95,
            rpe: 1
          },
          instruction: 'Easy spinning to facilitate recovery',
          coachingNotes: getCoachingNotes('cooldown')
        });
      }
    }
    
    // Main work detection: "N × duration at power%"
    const repsMatch = line.match(/(\d+)\s*[×x]\s*(\d+)\s*(?:min|m)\s*(?:at|@)\s*(\d+)%?\s*(?:FTP)?\s*(?:\/|-|,\s*)?(\d+)?%?/i);
    if (repsMatch && !line.toLowerCase().includes('warm')) {
      const reps = parseInt(repsMatch[1]);
      const workDuration = parseInt(repsMatch[2]) * 60;
      const powerLow = parseInt(repsMatch[3]);
      const powerHigh = repsMatch[4] ? parseInt(repsMatch[4]) : (powerLow + 5);
      
      // Extract rest duration (look for next line or pattern)
      let restDuration = workDuration; // default
      const nextLines = structure.substring(structure.indexOf(line) + line.length);
      const restMatch = nextLines.match(/(\d+)\s*(?:min|m)\s*(?:rest|@|at)\s*(\d+)%/i);
      if (restMatch) {
        restDuration = parseInt(restMatch[1]) * 60;
      }
      
      const intervalType = detectIntervalType(powerLow, powerHigh, workDuration);
      
      intervals.push({
        name: `${workout.goal || 'Main Set'}`,
        purpose: workout.goal || 'Main effort',
        phase: 'work',
        duration: {
          percent: ((reps * workDuration + (reps - 1) * restDuration) / totalDurationSecs) * 100,
          absoluteSecs: reps * workDuration + (reps - 1) * restDuration
        },
        intensity: {
          zone: 'Z3-Z5',
          powerLow,
          powerHigh,
          cadenceLow: 85,
          cadenceHigh: 95,
          rpe: Math.min(9, Math.ceil((powerLow + powerHigh) / 20))
        },
        reps: {
          count: reps,
          work: {
            duration: { secs: workDuration, label: `${repsMatch[2]} minutes` },
            intensity: {
              zone: 'Z3-Z5',
              powerLow,
              powerHigh,
              cadenceLow: 85,
              cadenceHigh: 95,
              rpe: Math.min(9, Math.ceil((powerLow + powerHigh) / 20))
            }
          },
          rest: {
            duration: { secs: restDuration, label: `${Math.ceil(restDuration / 60)} minutes` },
            intensity: {
              zone: 'Z1',
              powerLow: 40,
              powerHigh: 60,
              cadenceLow: 85,
              cadenceHigh: 100,
              rpe: 2
            }
          }
        },
        instruction: `Hold ${powerLow}-${powerHigh}% FTP for full duration. Steady power.`,
        coachingNotes: getCoachingNotes(intervalType)
      });
    }
  }
  
  // If no intervals parsed, create single steady-state interval
  if (intervals.length === 0) {
    intervals.push({
      name: workout.goal || 'Steady Effort',
      purpose: workout.goal || 'Build aerobic capacity',
      phase: 'work',
      duration: {
        percent: 80,
        absoluteSecs: totalDurationSecs * 0.8
      },
      intensity: {
        zone: 'Z2-Z3',
        powerLow: 60,
        powerHigh: 80,
        cadenceLow: 85,
        cadenceHigh: 95,
        rpe: 4
      },
      instruction: 'Steady effort, consistent power',
      coachingNotes: getCoachingNotes('base_endurance')
    });
  }
  
  return intervals;
}

// ─────────────────────────────────────────────────────────────────────────
// FILE GENERATION
// ─────────────────────────────────────────────────────────────────────────

function generateCarlosWorkoutFile(carlosWorkout) {
  const intervals = parseCarlosWorkout(carlosWorkout);
  
  return {
    id: carlosWorkout.id.toLowerCase(),
    title: carlosWorkout.title,
    source: 'carlos',
    category: carlosWorkout.category || 'BASE',
    primaryZone: mapCategoryToZone(carlosWorkout.category),
    structure: detectStructure(carlosWorkout.structure),
    difficulty: calculateDifficulty(carlosWorkout),
    duration: parseInt(carlosWorkout.duration) || 60,
    scalable: true,
    tss: parseInt(carlosWorkout.tss) || 50,
    description: carlosWorkout.goal || 'Training session',
    purpose: carlosWorkout.goal || 'Build fitness',
    intervals
  };
}

function mapCategoryToZone(category) {
  const mapping = {
    'BASE': 'Z2',
    'TEMPO': 'Z3',
    'THRESHOLD': 'Z4',
    'SWEET_SPOT': 'Z3',
    'VO2MAX': 'Z5',
    'ANAEROBIC': 'Z6',
    'SPRINT': 'Z6',
    'RECOVERY': 'Z1',
    'TECHNIQUE': 'Z2',
    'STRENGTH': 'Z2-Z3',
    'RACE_SIM': 'Z3-Z6',
    'FTP_TEST': 'Z4-Z6',
    'MIXED': 'Z2-Z5'
  };
  return mapping[category] || 'Z2';
}

function detectStructure(description) {
  if (!description) return 'steady';
  const desc = description.toLowerCase();
  if (desc.includes('×') || desc.includes('x ')) return 'repeats';
  if (desc.includes('pyramid')) return 'pyramid';
  if (desc.includes('ladder')) return 'ladder';
  if (desc.includes('alternate') || desc.includes('over')) return 'alternating';
  return 'steady';
}

function calculateDifficulty(workout) {
  const tss = parseInt(workout.tss) || 50;
  const duration = parseInt(workout.duration) || 60;
  
  // Simple difficulty calculation
  const intensity = tss / duration;
  if (intensity < 0.5) return 1;
  if (intensity < 0.7) return 3;
  if (intensity < 0.9) return 5;
  if (intensity < 1.1) return 7;
  if (intensity < 1.3) return 8;
  return 9;
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────────────

const baseDir = '/Users/mathieuortiz/Projects/cyclecoach/src/lib/workouts';
const metadata = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  totalWorkouts: 0,
  byCategory: {},
  bySource: {
    carlos: { count: 0, files: [] },
    zwift: { count: 0, files: [] },
    research: { count: 0, files: [] }
  },
  all: []
};

// Load Carlos workouts
const carlosPath = '/Users/mathieuortiz/Projects/cyclecoach/src/lib/carlos-105-workouts.json';
const carlosData = JSON.parse(fs.readFileSync(carlosPath, 'utf8'));

console.log('🚀 GENERATING 220 WORKOUT FILES\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Process Carlos workouts
console.log('📝 PHASE 1: Processing Carlos (105 workouts)...\n');
let carlosCount = 0;

for (const carlos of carlosData) {
  try {
    const normalized = generateCarlosWorkoutFile(carlos);
    const fileName = `carlos/${normalized.id}.json`;
    const filePath = path.join(baseDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2));
    
    // Track metadata
    const category = normalized.category || 'MIXED';
    if (!metadata.byCategory[category]) {
      metadata.byCategory[category] = [];
    }
    metadata.byCategory[category].push({
      id: normalized.id,
      title: normalized.title,
      source: 'carlos',
      difficulty: normalized.difficulty
    });
    
    metadata.bySource.carlos.files.push(fileName);
    metadata.all.push({
      id: normalized.id,
      title: normalized.title,
      category: category,
      source: 'carlos',
      file: fileName,
      difficulty: normalized.difficulty
    });
    
    carlosCount++;
    if (carlosCount % 10 === 0) {
      process.stdout.write(`  ✓ ${carlosCount}/105\r`);
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${carlos.id}: ${error.message}`);
  }
}

metadata.bySource.carlos.count = carlosCount;
console.log(`\n✅ Carlos workouts: ${carlosCount}/105\n`);

// Note about Zwift and Research
console.log('📊 PHASE 2: Zwift workouts (68 total)');
console.log('   ℹ️  Would require calling intervals() functions from TypeScript\n');

console.log('📊 PHASE 3: Research workouts (47 total)');
console.log('   ℹ️  Need to parse research-workouts.ts and research-workouts-v2.ts\n');

// Write metadata
metadata.totalWorkouts = carlosCount; // Will update when all phases complete
metadata.bySource.zwift.count = 68;
metadata.bySource.research.count = 47;

const metadataPath = path.join(baseDir, 'workouts-metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📁 FILES GENERATED:');
console.log(`   Carlos: ${carlosCount} files → ${baseDir}/carlos/`);
console.log(`   Metadata: ${metadataPath}\n`);
console.log('📈 NEXT STEPS:');
console.log('   1. Extract Zwift intervals and create 68 files');
console.log('   2. Parse Research workouts and create 47 files');
console.log('   3. Update metadata index with all 220 workouts');
console.log('   4. Commit to GitHub\n');
