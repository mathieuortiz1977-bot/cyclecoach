#!/usr/bin/env node
/**
 * COMPLETE COACHING NOTES GENERATOR
 * 
 * Generates coaching notes for ALL 184 unique interval names
 * Across all 4 personalities = 736 total coaching notes
 * 
 * Creates 100% coverage for the entire workout database
 */

const fs = require('fs');
const path = require('path');

// All 184 unique interval names extracted from the database
const allIntervalNames = [
  "15/9 VO2", "20s Hard", "20s Hard 2", "20s Hard 3", "30/30", "30/30s", "40/20s",
  "40s Easy", "40s Easy 2", "90% SS", "Activation Surge 1", "Activation Surge 2",
  "Advanced Drills", "Anaerobic 1", "Anaerobic 2", "Anaerobic 3", "Another Surge",
  "Attacks", "Base", "Base Block", "Base Road", "Base Spin", "Block 1", "Block 1 High",
  "Block 1 Mid", "Blue Unicorn", "Cadence Variation", "Calibration", "Climb 1", "Climb 2",
  "Cool-down", "Double VO2", "Easy", "Easy 1", "Easy 2", "Easy Block", "Easy Spin", "Easy Start",
  "FTP + Surges", "FTP Base", "FTP Block 1", "FTP Repeats", "FTP Test", "Final Easy", "Force Work",
  "Free Ride", "Green Unicorn", "HIIT W4", "HIIT W6", "HIIT W8", "Hard 1", "Hard 2", "Hard Attacks",
  "Hard Step 1", "Heavy Resistance", "High Cadence (85%)", "High Cadence 2", "Hill Surge", "Indigo Unicorn",
  "LOX Work", "Ladder Step 1", "Ladder Step 2", "Ladder Step 3", "Ladder Step 4", "Ladder Step 5",
  "Long SS", "Low Cadence", "Low Cadence (80%)", "Low Cadence 2", "Low Cadence FTP 1", "Low Cadence FTP 2",
  "Malevolent", "Microbursts", "Mixed", "Mixed Work", "Orange Unicorn", "Over-Under", "P1-1min",
  "P1-2min", "P1-3min", "P2-1min", "P2-2min", "P2-3min", "Part 1", "Part 2", "Pedaling Drills",
  "Pyramid", "Pyramid 1min", "Pyramid 1min Down", "Pyramid 2min", "Pyramid 2min Down", "Pyramid 3min",
  "Pyramid 3min Down", "Pyramid 4min", "Race Sim", "Ramp", "Recovery", "Red Unicorn", "Rest",
  "Rest 1", "Rest 2", "Return", "SS 1", "SS 2", "SS 3", "SS Block 1", "SS Block 1 Kick", "SS Block 2",
  "SS Test 1", "SS Test 2", "Seated", "Seated 2", "Settle", "Skills Work", "Sprint", "Sprint 1",
  "Sprint 10s", "Sprint 2", "Sprint 20s", "Sprint 3", "Sprint 30s", "Sprint Base", "Sprints", "Standing",
  "Standing 1", "Standing 2", "Standing 3", "Steady Endurance", "Steady Z2", "Step 2", "Step 3", "Step 4",
  "Strength", "Surge 1", "Surge 2", "Sweet Spot", "Sweet Spot Block", "TH 1", "TH 2", "TH 3",
  "TH Block 1", "TH Block 2", "TH Rep 1", "TH Rep 2", "TH Rep 3", "TH Test 1", "TH Test 2", "Tempo",
  "Tempo 1", "Tempo 2", "Tempo 3", "Tempo Block", "Tempo Ladder", "Threshold", "Threshold A", "Threshold B",
  "Threshold C", "Threshold D", "Threshold E", "Threshold F", "Threshold High", "Threshold Low",
  "VO2 1", "VO2 Burst 1", "VO2 Burst 2", "VO2 Burst 3", "VO2 Burst 4", "VO2 Ladder", "VO2 Rep 1",
  "VO2 Rep 2", "VO2 Rep 3", "VO2 Repeats", "VO2 Surge", "VO2 Surge 2", "VO2 Variant", "VO2 Work",
  "VO2max", "Violet Unicorn", "Warm-up", "Warm-up Extended", "Work 1", "Work 2", "Work 3", "Yellow Unicorn"
];

const personalities = ["DARK_HUMOR", "MOTIVATIONAL", "TECHNICAL", "MIXED"];

// Categorize intervals for smarter note generation
function categorizeInterval(name) {
  const lower = name.toLowerCase();
  
  if (lower.includes("warm") || lower.includes("easy start")) return "warmup";
  if (lower.includes("recovery") || lower.includes("rest") || lower.includes("easy") && !lower.includes("block")) return "recovery";
  if (lower.includes("base") || lower.includes("endurance") || lower.includes("steady z2")) return "endurance";
  if (lower.includes("ss") || lower.includes("sweet spot")) return "sweetspot";
  if (lower.includes("tempo")) return "tempo";
  if (lower.includes("th") || lower.includes("threshold") || lower.includes("ftp")) return "threshold";
  if (lower.includes("vo2") || lower.includes("hiit")) return "vo2max";
  if (lower.includes("anaerobic") || lower.includes("lox")) return "anaerobic";
  if (lower.includes("sprint") || lower.includes("jump")) return "sprint";
  if (lower.includes("cool") || lower.includes("final easy")) return "cooldown";
  if (lower.includes("cadence") || lower.includes("pedal") || lower.includes("drill") || lower.includes("skill")) return "technique";
  if (lower.includes("low cadence") || lower.includes("force") || lower.includes("strength") || lower.includes("heavy")) return "strength";
  if (lower.includes("over-under") || lower.includes("micro") || lower.includes("surge") || lower.includes("attack")) return "advanced";
  if (lower.includes("ladder") || lower.includes("pyramid")) return "pyramid";
  if (lower.includes("race") || lower.includes("ramp")) return "testing";
  if (lower.includes("mixed") || lower.includes("work")) return "mixed";
  return "mixed";
}

// Generate coaching note based on interval category and personality
function generateCoachingNote(intervalName, personality) {
  const category = categorizeInterval(intervalName);
  const lower = intervalName.toLowerCase();
  
  // Map category to coaching note template
  const templates = {
    warmup: {
      DARK_HUMOR: `Warming up with ${intervalName}. Get your engine ready for what's coming.`,
      MOTIVATIONAL: `Great start with ${intervalName}! You're preparing your body for an amazing effort.`,
      TECHNICAL: `Progressive warm-up phase activating neuromuscular systems for the work ahead.`,
      MIXED: `Take your time with ${intervalName}. Building momentum for what's next.`
    },
    recovery: {
      DARK_HUMOR: `${intervalName} is your permission to breathe. Don't waste it.`,
      MOTIVATIONAL: `${intervalName} is recovery — your body's chance to adapt and grow stronger.`,
      TECHNICAL: `Low-intensity work promoting lactate clearance and parasympathetic activation.`,
      MIXED: `Ease into ${intervalName}. This is where your body rebuilds.`
    },
    endurance: {
      DARK_HUMOR: `${intervalName} is long and steady. Boring is fast.`,
      MOTIVATIONAL: `${intervalName} builds your aerobic foundation. Every minute makes you stronger.`,
      TECHNICAL: `Sustained Z2 work maximizing fat oxidation and mitochondrial development.`,
      MIXED: `Hold this pace steady. ${intervalName} is where fitness is built quietly.`
    },
    sweetspot: {
      DARK_HUMOR: `${intervalName} — close enough to hurt, easy enough to repeat. This is productive pain.`,
      MOTIVATIONAL: `${intervalName} teaches your body to hold harder power efficiently. Real progress.`,
      TECHNICAL: `Sweet spot intensity provides optimal training stress with manageable fatigue.`,
      MIXED: `${intervalName} is the productive zone. You're working but sustainable.`
    },
    tempo: {
      DARK_HUMOR: `${intervalName} is the warm-up for real suffering. Embrace it.`,
      MOTIVATIONAL: `${intervalName} builds lactate clearing capacity. You're getting tougher.`,
      TECHNICAL: `Sub-threshold work developing lactate tolerance without excessive fatigue.`,
      MIXED: `${intervalName} is controlled hard effort. Your body learns to handle intensity.`
    },
    threshold: {
      DARK_HUMOR: `${intervalName} — your limit in polite company. This is where fitness lives.`,
      MOTIVATIONAL: `${intervalName} makes you faster. Every rep raises your ceiling.`,
      TECHNICAL: `FTP-level work providing maximum power development stimulus.`,
      MIXED: `${intervalName} is hard but sustainable. Stay focused and execute.`
    },
    vo2max: {
      DARK_HUMOR: `${intervalName} just punched your aerobic system. Embrace the chaos.`,
      MOTIVATIONAL: `${intervalName} expands your VO2max. You're reaching for elite fitness.`,
      TECHNICAL: `Maximum oxidative stress driving mitochondrial biogenesis and capillary growth.`,
      MIXED: `${intervalName} is peak aerobic work. You're building real capacity.`
    },
    anaerobic: {
      DARK_HUMOR: `${intervalName} — your lactate system just got a nasty surprise.`,
      MOTIVATIONAL: `${intervalName} teaches your body maximum sustained power. You're getting powerful.`,
      TECHNICAL: `Supra-threshold work maximizing lactate tolerance and Type II recruitment.`,
      MIXED: `${intervalName} is all-out effort. Suffer now, celebrate after.`
    },
    sprint: {
      DARK_HUMOR: `${intervalName} — you're now riding like your bike was stolen. Maximum power.`,
      MOTIVATIONAL: `${intervalName} builds the explosive power that wins races. You've got this.`,
      TECHNICAL: `Maximum neuromuscular recruitment generating peak power output.`,
      MIXED: `${intervalName} is all-out. Give everything and own the result.`
    },
    cooldown: {
      DARK_HUMOR: `${intervalName} means you survived. Spin easy and be grateful.`,
      MOTIVATIONAL: `Great work! ${intervalName} is your earned recovery. Let yourself transition.`,
      TECHNICAL: `Low-intensity recovery promoting lactate clearance and parasympathetic activation.`,
      MIXED: `${intervalName} — breathe easy and let the victory sink in.`
    },
    technique: {
      DARK_HUMOR: `${intervalName} — remember how to pedal smooth instead of like a machine.`,
      MOTIVATIONAL: `${intervalName} teaches your body efficiency. Small improvements compound into real gains.`,
      TECHNICAL: `Neuromuscular proprioception and pedaling economy development through isolation work.`,
      MIXED: `Focus on ${intervalName} — smooth, controlled, efficient movement.`
    },
    strength: {
      DARK_HUMOR: `${intervalName} — big gear, low RPM. You're building horsepower.`,
      MOTIVATIONAL: `${intervalName} builds the power foundation everything else relies on.`,
      TECHNICAL: `Low-cadence force work recruiting Type II fibers for absolute power development.`,
      MIXED: `${intervalName} is strength work. Go slow and powerful.`
    },
    advanced: {
      DARK_HUMOR: `${intervalName} — your energy systems are about to get complicated. Good.`,
      MOTIVATIONAL: `${intervalName} trains race-specific adaptability. You're getting tactical.`,
      TECHNICAL: `Advanced stimulus pattern developing multiple energy system adaptations simultaneously.`,
      MIXED: `${intervalName} is complex work. Your body learns to be powerful everywhere.`
    },
    pyramid: {
      DARK_HUMOR: `${intervalName} — climbing up then down. Suffer both ways.`,
      MOTIVATIONAL: `${intervalName} teaches pacing and power management. Championship training.`,
      TECHNICAL: `Progressive then descending intensity develops lactate tolerance and pacing awareness.`,
      MIXED: `${intervalName} climbs then descends. Control your effort through both.`
    },
    testing: {
      DARK_HUMOR: `${intervalName} — time to find your real limit. Spoiler: it hurts.`,
      MOTIVATIONAL: `${intervalName} reveals your true capability. Own it.`,
      TECHNICAL: `Performance assessment establishing fitness baselines for training calibration.`,
      MIXED: `${intervalName} is all-out. Push to your limit and know your power.`
    },
    mixed: {
      DARK_HUMOR: `${intervalName} — varied intensity keeping your systems honest.`,
      MOTIVATIONAL: `${intervalName} develops complete adaptability. You're becoming a complete athlete.`,
      TECHNICAL: `Mixed stimulus providing broad training adaptations across multiple systems.`,
      MIXED: `${intervalName} is varied work. Your body handles all intensities.`
    }
  };
  
  return (templates[category] && templates[category][personality]) || 
    `${intervalName} — stay focused and execute the plan.`;
}

// Generate all coaching notes
console.log('\n🎯 COMPLETE COACHING NOTES GENERATION\n');
console.log(`Generating notes for ${allIntervalNames.length} unique interval names`);
console.log(`Across ${personalities.length} personalities = ${allIntervalNames.length * personalities.length} total notes\n`);

const coachingNotes = {};
let count = 0;

for (const intervalName of allIntervalNames) {
  const key = intervalName; // Use interval name directly as key
  coachingNotes[key] = {};
  
  for (const personality of personalities) {
    const note = generateCoachingNote(intervalName, personality);
    coachingNotes[key][personality] = note;
    count++;
  }
}

// Save to file
const outputPath = path.join(process.cwd(), 'src/lib/coaching-notes-all.json');
fs.writeFileSync(outputPath, JSON.stringify(coachingNotes, null, 2));

console.log(`✅ COMPLETE!`);
console.log(`Generated ${count} coaching notes`);
console.log(`Saved to: ${outputPath}`);
console.log(`\n📊 Coverage: 100% (${allIntervalNames.length} interval names × 4 personalities)`);
console.log(`\n🚀 All workouts now have complete coaching coverage!\n`);
