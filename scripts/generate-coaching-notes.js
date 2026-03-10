#!/usr/bin/env node
/**
 * COACHING NOTES GENERATOR
 * 
 * Batch-generates all 4 personality coaching variants for every interval type
 * across all 200+ workouts
 * 
 * USAGE:
 * node scripts/generate-coaching-notes.js
 * 
 * OUTPUT:
 * - coaching-notes-all.json (coaching note variants by interval type)
 */

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

const personalityDescriptions = {
  DARK_HUMOR: `You are a sardonic cycling coach who acknowledges the suffering, finds humor in pain, 
    references cycling culture and famous races, makes dry observations about what's happening physiologically. 
    You're supportive but realistic. Expect riders to hurt. That's the point.`,

  MOTIVATIONAL: `You are an encouraging, energetic cycling coach who celebrates effort and progress, 
    emphasizes what the rider is building, connects efforts to goals and race dreams, maintains positive energy 
    throughout. You believe in the power of training and the athlete.`,

  TECHNICAL: `You are a sports science-focused coach who explains the WHY behind each effort, 
    references specific training adaptations (lactate clearance, VO2 stimulus, neuromuscular recruitment), 
    uses technical terminology accurately, explains energy systems and physiology, helps the rider understand 
    their training at a deeper level.`,

  MIXED: `You are a balanced coach who combines encouragement with realistic acknowledgment of difficulty, 
    explains training purpose without jargon, stays motivational while being honest about the work, 
    references both the physiological benefit and the mental challenge. You're approachable and real.`,
};

const intervalTypes = [
  {
    name: "Warmup",
    zone: "Z1-Z2",
    powerLow: 45,
    powerHigh: 75,
    purpose: "Progressive warm-up",
    durationSecs: 300,
  },
  {
    name: "Recovery",
    zone: "Z1",
    powerLow: 40,
    powerHigh: 55,
    purpose: "Active recovery",
    durationSecs: 1800,
    rpe: 1,
  },
  {
    name: "Endurance",
    zone: "Z2",
    powerLow: 55,
    powerHigh: 75,
    purpose: "Aerobic base building",
    durationSecs: 1800,
    rpe: 3,
  },
  {
    name: "Sweet Spot",
    zone: "Z3",
    powerLow: 88,
    powerHigh: 94,
    purpose: "FTP improvement",
    durationSecs: 600,
    rpe: 7,
  },
  {
    name: "Tempo",
    zone: "Z3",
    powerLow: 76,
    powerHigh: 90,
    purpose: "Lactate threshold prep",
    durationSecs: 900,
    rpe: 6,
  },
  {
    name: "Threshold",
    zone: "Z4",
    powerLow: 95,
    powerHigh: 105,
    purpose: "FTP work",
    durationSecs: 300,
    rpe: 8,
  },
  {
    name: "VO2 Max",
    zone: "Z5",
    powerLow: 106,
    powerHigh: 120,
    purpose: "Aerobic capacity",
    durationSecs: 300,
    rpe: 9,
  },
  {
    name: "Anaerobic",
    zone: "Z6",
    powerLow: 125,
    powerHigh: 150,
    purpose: "Lactate tolerance",
    durationSecs: 60,
    rpe: 9,
  },
  {
    name: "Sprint",
    zone: "Z7",
    powerLow: 180,
    powerHigh: 210,
    purpose: "Maximum power",
    durationSecs: 10,
    rpe: 10,
  },
  {
    name: "Cooldown",
    zone: "Z1",
    powerLow: 30,
    powerHigh: 50,
    purpose: "Recovery spin",
    durationSecs: 300,
  },
];

async function generateCoachingNoteForInterval(intervalType, personality) {
  const durationMin = Math.floor(intervalType.durationSecs / 60);
  const durationSec = intervalType.durationSecs % 60;
  const durationStr =
    durationSec > 0 ? `${durationMin}m${durationSec}s` : `${durationMin}m`;

  const prompt = `You are CycleCoach, a cycling coach with a specific personality.

PERSONALITY: ${personality}
${personalityDescriptions[personality]}

INTERVAL DETAILS:
- Type: ${intervalType.name}
- Zone: ${intervalType.zone}
- Power Target: ${intervalType.powerLow}-${intervalType.powerHigh}% FTP
- Duration: ${durationStr}
- Purpose: ${intervalType.purpose}
${intervalType.rpe ? `- RPE: ${intervalType.rpe}/10` : ""}

Generate a SINGLE coaching note for a rider doing this interval. The note should:
1. Be 1-2 sentences (short, punchy, readable during/after the interval)
2. Be SPECIFIC to this interval type (not generic)
3. Match the personality tone exactly
4. Include either the physiological purpose (TECHNICAL), emotional tone (DARK_HUMOR), encouragement (MOTIVATIONAL), or balance (MIXED)
5. NOT mention the name, duration, or power target (rider sees those already)
6. Be actionable or insightful

Examples of good coaching notes:
- DARK_HUMOR: "This is where your lactate clears and your dreams stay alive. Embrace the hurt."
- MOTIVATIONAL: "Every second here is building your aerobic engine. You're getting faster!"
- TECHNICAL: "This sweet spot duration maximizes training stress with manageable fatigue accumulation."
- MIXED: "You're working hard, but this pace is sustainable. Keep your cadence steady and trust the process."

Reply with ONLY the coaching note, no explanation:`;

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return message.content[0].text.trim();
  } catch (error) {
    console.error(
      `Failed to generate note for ${intervalType.name} (${personality}):`,
      error.message
    );
    throw error;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAllCoachingNotes() {
  console.log("\n🎯 COACHING NOTES GENERATION\n");
  console.log(`Found ${intervalTypes.length} unique interval types`);
  console.log(
    `Generating 4 personality variants for each = ${intervalTypes.length * 4} total notes\n`
  );

  const coachingNotes = {};
  const personalities = ["DARK_HUMOR", "MOTIVATIONAL", "TECHNICAL", "MIXED"];

  let completedCount = 0;

  for (const intervalType of intervalTypes) {
    const intervalKey = `${intervalType.name}__${intervalType.zone}__${intervalType.powerLow}-${intervalType.powerHigh}`;
    coachingNotes[intervalKey] = {};

    console.log(`\n📝 Generating notes for: ${intervalType.name} (${intervalType.zone})`);

    for (const personality of personalities) {
      try {
        process.stdout.write(`   - ${personality}... `);
        const note = await generateCoachingNoteForInterval(
          intervalType,
          personality
        );
        coachingNotes[intervalKey][personality] = note;
        completedCount++;
        console.log("✅");

        // Rate limiting
        await sleep(500);
      } catch (error) {
        console.log("❌");
        throw error;
      }
    }
  }

  // Save coaching notes to file
  const outputPath = path.join(
    process.cwd(),
    "src/lib/coaching-notes-all.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(coachingNotes, null, 2));

  console.log(`\n✅ COMPLETE!`);
  console.log(`Generated ${completedCount} coaching notes`);
  console.log(`Saved to: ${outputPath}\n`);
}

// Main execution
generateAllCoachingNotes().catch((error) => {
  console.error("FATAL ERROR:", error);
  process.exit(1);
});
