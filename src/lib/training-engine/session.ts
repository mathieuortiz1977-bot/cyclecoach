/**
 * Training Session Builder
 * Factory pattern + protocol library for generating workouts
 */

import {
  AthleteProfile,
  IntervalBlock,
  IntervalProtocol,
  IntervalSet,
  ProgressionBlock,
  ProgressionWeek,
  SessionBuilderConfig,
  SessionGoal,
  TrainingSession,
  TrainingZone,
} from "./types";
import { PowerCalculator, TssCalculator, enrichBlockWithCalculations } from "./zones";

// ─── INTERVAL BLOCK FACTORY ──────────────────────────────────────

export class IntervalBlockFactory {
  constructor(private athlete: AthleteProfile) {}

  /**
   * Create a typed interval block with all calculations
   */
  createBlock(
    name: string,
    durationSeconds: number,
    targetPowerMin: number,
    targetPowerMax: number,
    zone: TrainingZone,
    cadenceLow?: number,
    cadenceHigh?: number,
    rpe?: number,
    coachNote?: string,
  ): IntervalBlock {
    const block: IntervalBlock = {
      name,
      durationSeconds,
      targetPowerMin,
      targetPowerMax,
      zone,
      cadenceLow,
      cadenceHigh,
      rpe,
      coachNote,
    };

    return enrichBlockWithCalculations(block, this.athlete);
  }

  // ─── Standard warmup/cooldown ────────────────────────────────

  createWarmupBlock(durationSeconds: number = 600): IntervalBlock {
    return this.createBlock("Warmup", durationSeconds, 40, 55, "Z1", 85, 95, 2, "Gradual leg spinup");
  }

  createOpenerBlock(durationSeconds: number = 120): IntervalBlock {
    return this.createBlock("Opener", durationSeconds, 85, 95, "Z3", 90, 100, 5, "Light surge");
  }

  createCooldownBlock(durationSeconds: number = 300): IntervalBlock {
    return this.createBlock("Cooldown", durationSeconds, 30, 50, "Z1", 80, 90, 1, "Easy spin");
  }

  // ─── Rest intervals ─────────────────────────────────────────

  createRestBlock(durationSeconds: number): IntervalBlock {
    return this.createBlock("Rest", durationSeconds, 30, 45, "Z1", 75, 85, 1, "Easy recovery pedaling");
  }
}

// ─── PROTOCOL LIBRARY ────────────────────────────────────────────

export class ProtocolLibrary {
  constructor(private athlete: AthleteProfile) {}

  private factory = new IntervalBlockFactory(this.athlete);

  /**
   * 30/30 — VO2 Max intervals (2 sets × 12 reps)
   * 30s hard / 30s easy recovery
   */
  create30_30(): IntervalSet[] {
    const workBlock = this.factory.createBlock(
      "30s Effort",
      30,
      110,
      130,
      "Z5",
      85,
      105,
      8,
      "Controlled aggression",
    );

    const restBlock = this.factory.createRestBlock(30);

    // 2 sets of 12 reps
    return Array(2)
      .fill(0)
      .map((_, setIdx) => ({
        repetitions: 12,
        blocks: [workBlock, restBlock],
        restBetweenSets: setIdx === 0 ? 600 : undefined,
      }));
  }

  /**
   * 40/20 — Higher intensity VO2 (higher density)
   * 40s hard / 20s easy recovery × 12
   */
  create40_20(): IntervalSet[] {
    const workBlock = this.factory.createBlock(
      "40s Effort",
      40,
      115,
      135,
      "Z5",
      85,
      110,
      8,
      "Sustained high power",
    );

    const restBlock = this.factory.createRestBlock(20);

    return [
      {
        repetitions: 12,
        blocks: [workBlock, restBlock],
      },
    ];
  }

  /**
   * 4×8 — VO2 Max protocol (Seiler research)
   * 4 × 8 minutes with 3-min rest
   */
  create4x8(): IntervalSet[] {
    const workBlock = this.factory.createBlock(
      "8-min Effort",
      480,
      104,
      115,
      "Z5",
      85,
      105,
      7,
      "Steady VO2 max pace",
    );

    return [
      {
        repetitions: 4,
        blocks: [workBlock],
        restBetweenSets: 180,
      },
    ];
  }

  /**
   * 3×10 — Threshold intervals
   * 3 × 10 minutes with 4-min rest
   */
  create3x10(): IntervalSet[] {
    const workBlock = this.factory.createBlock(
      "10-min Effort",
      600,
      88,
      94,
      "Z4",
      80,
      100,
      7,
      "Hold steady threshold",
    );

    return [
      {
        repetitions: 3,
        blocks: [workBlock],
        restBetweenSets: 240,
      },
    ];
  }

  /**
   * 2×20 — Coggan classic threshold
   * 2 × 20 minutes with 5-min rest
   */
  create2x20(): IntervalSet[] {
    const workBlock = this.factory.createBlock(
      "20-min Effort",
      1200,
      88,
      94,
      "Z4",
      75,
      95,
      7,
      "Gold standard for FTP development",
    );

    return [
      {
        repetitions: 2,
        blocks: [workBlock],
        restBetweenSets: 300,
      },
    ];
  }

  /**
   * Tabata — Anaerobic power
   * 2 sets × (8 × 20s on / 10s off)
   */
  createTabata(): IntervalSet[] {
    const workBlock = this.factory.createBlock(
      "20s All-out",
      20,
      150,
      200,
      "Z6",
      100,
      130,
      9,
      "Maximum effort sprint",
    );

    const restBlock = this.factory.createRestBlock(10);

    return Array(2)
      .fill(0)
      .map((_, setIdx) => ({
        repetitions: 8,
        blocks: [workBlock, restBlock],
        restBetweenSets: setIdx === 0 ? 300 : undefined,
      }));
  }

  /**
   * Pyramid — Sprint power
   * Progressive efforts: 30s / 60s / 90s / 120s / 90s / 60s / 30s
   */
  createPyramid(): IntervalSet[] {
    const durations = [30, 60, 90, 120, 90, 60, 30];

    const blocks = durations.map((secs) =>
      this.factory.createBlock(
        `${secs}s Pyramid`,
        secs,
        120,
        150,
        "Z6",
        100,
        130,
        8,
        "Build and descend power",
      ),
    );

    const restBlocks = durations.map((secs) => this.factory.createRestBlock(Math.floor(secs / 2)));

    // Interleave work and rest
    const interleavedBlocks: IntervalBlock[] = [];
    for (let i = 0; i < blocks.length; i++) {
      interleavedBlocks.push(blocks[i]);
      if (i < restBlocks.length - 1) {
        interleavedBlocks.push(restBlocks[i]);
      }
    }

    return [
      {
        repetitions: 1,
        blocks: interleavedBlocks,
      },
    ];
  }

  /**
   * Get protocol by name
   */
  getProtocol(protocol: IntervalProtocol): IntervalSet[] {
    switch (protocol) {
      case "30_30":
        return this.create30_30();
      case "40_20":
        return this.create40_20();
      case "4x8":
        return this.create4x8();
      case "3x10":
        return this.create3x10();
      case "2x20":
        return this.create2x20();
      case "Tabata":
        return this.createTabata();
      case "Pyramid":
        return this.createPyramid();
    }
  }
}

// ─── SESSION BUILDER ─────────────────────────────────────────────

export class SessionBuilder {
  private protocolLib: ProtocolLibrary;
  private powerCalc: PowerCalculator;
  private tssCalc: TssCalculator;
  private factory: IntervalBlockFactory;

  constructor(config: SessionBuilderConfig) {
    this.protocolLib = new ProtocolLibrary(config.athlete);
    this.powerCalc = new PowerCalculator(config.athlete);
    this.tssCalc = new TssCalculator(config.athlete);
    this.factory = new IntervalBlockFactory(config.athlete);
  }

  /**
   * Determine default protocol for a goal
   */
  private getDefaultProtocol(goal: SessionGoal): IntervalProtocol {
    const protocolMap: Record<SessionGoal, IntervalProtocol> = {
      VO2Max: "30_30",
      LactateThreshold: "4x8",
      SweetSpot: "2x20",
      Anaerobic: "Tabata",
      SprintPower: "Pyramid",
      Endurance: "2x20",
    };
    return protocolMap[goal];
  }

  /**
   * Build a complete training session
   */
  build(config: SessionBuilderConfig): TrainingSession {
    const {
      athlete,
      goal,
      protocol: overrideProtocol,
      warmupDuration = 600,
      cooldownDuration = 300,
      volumeMultiplier = 1.0,
    } = config;

    const protocol = overrideProtocol || this.getDefaultProtocol(goal);

    // Build structure
    const warmup = [this.factory.createWarmupBlock(warmupDuration)];
    const mainSets = this.protocolLib.getProtocol(protocol);
    const cooldown = [this.factory.createCooldownBlock(cooldownDuration)];

    // Calculate totals
    const allBlocks = [...warmup, ...mainSets.flatMap((s) => s.blocks.flatMap((b) => [b])), ...cooldown];
    const totalDurationSeconds = allBlocks.reduce((sum, b) => sum + b.durationSeconds, 0);
    const blockAvgPowers = allBlocks.map((b) => b.avgPower || 0);

    // TSS calculation
    const { np, if: if_, tss } = this.tssCalc.calculateSessionMetrics(totalDurationSeconds, blockAvgPowers);

    // Energy
    const totalKj = allBlocks.reduce((sum, b) => sum + (b.kj || 0), 0);
    const totalKcal = allBlocks.reduce((sum, b) => sum + (b.kcal || 0), 0);
    const avgPower = allBlocks.reduce((sum, b) => sum + (b.avgPower || 0), 0) / allBlocks.length;
    const carbsNeeded = this.powerCalc.getCarbNeeds(avgPower, totalDurationSeconds);

    // Goal-specific notes
    const coachingNotes = this.getCoachingNotes(goal);

    return {
      goal,
      protocol,
      athleteProfile: athlete,
      warmup,
      mainSets,
      cooldown,
      totalDurationSeconds,
      totalDurationMinutes: Math.round(totalDurationSeconds / 60),
      tss,
      np,
      intensityFactor: if_,
      totalKj,
      totalKcal,
      carbsNeeded,
      coachingNotes,
    };
  }

  /**
   * Goal-specific coaching guidance
   */
  private getCoachingNotes(goal: SessionGoal): string[] {
    const notes: Record<SessionGoal, string[]> = {
      VO2Max: [
        "Focus on controlled power during efforts",
        "Heart rate will lag — trust power targets",
        "Recover fully between sets",
      ],
      LactateThreshold: [
        "Settle into a sustainable pace",
        "Mental resilience is key — stay focused",
        "Even pacing beats surging",
      ],
      SweetSpot: [
        "This sweet spot trains both aerobic and anaerobic systems",
        "Perfect for building base fitness",
        "Good for completing in a fatigued state",
      ],
      Anaerobic: [
        "Maximum effort each interval",
        "Recovery between reps is crucial",
        "This session builds explosive power",
      ],
      SprintPower: [
        "Every rep counts — don't coast",
        "Neuromuscular power requires full concentration",
        "Rest fully between efforts",
      ],
      Endurance: [
        "Maintain steady pacing",
        "Focus on fueling properly",
        "This builds your aerobic engine",
      ],
    };
    return notes[goal];
  }
}

// ─── PROGRESSION PLANNER ────────────────────────────────────────

export class ProgressionPlanner {
  constructor(private athlete: AthleteProfile) {}

  /**
   * Build a 4-week progression block
   * Week 1: Baseline
   * Week 2: +15% volume
   * Week 3: Peak load
   * Week 4: Recovery at 60%
   */
  buildBlock(config: SessionBuilderConfig): ProgressionBlock {
    const baseSession = new SessionBuilder(config).build(config);

    const weeks: ProgressionWeek[] = [
      {
        weekNumber: 1,
        weekType: "Baseline",
        sessions: [baseSession],
      },
      {
        weekNumber: 2,
        weekType: "Build",
        sessions: [
          new SessionBuilder({
            ...config,
            volumeMultiplier: 1.15,
          }).build({ ...config, volumeMultiplier: 1.15 }),
        ],
      },
      {
        weekNumber: 3,
        weekType: "Peak",
        sessions: [
          new SessionBuilder({
            ...config,
            volumeMultiplier: 1.25,
          }).build({ ...config, volumeMultiplier: 1.25 }),
        ],
      },
      {
        weekNumber: 4,
        weekType: "Recovery",
        sessions: [
          new SessionBuilder({
            ...config,
            volumeMultiplier: 0.6,
          }).build({ ...config, volumeMultiplier: 0.6 }),
        ],
      },
    ];

    const blockTss = weeks.reduce((sum, week) => sum + (week.weeklyTss || 0), 0);

    return {
      goal: config.goal,
      weeks,
      blockTss,
    };
  }
}
