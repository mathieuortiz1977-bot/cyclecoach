/**
 * PURPOSE LIBRARY - Standardized, SHORT interval purposes across all workouts
 * Ensures consistency, clarity, and UI compatibility across all modes (dark, light, mixed)
 */

export const PURPOSE = {
  // WARMUP & COOLDOWN
  WARMUP: "Prepare body",
  COOLDOWN: "Recovery",
  RECOVERY: "Active recovery",

  // BASE / ENDURANCE
  BASE_Z1_Z2: "Aerobic base",
  LONG_ENDURANCE: "Long endurance",
  EXTENDED_BASE: "Extended base",
  AEROBIC_BUILD: "Build aerobic",
  FAT_OXIDATION: "Fat burning",

  // TEMPO & STEADY
  TEMPO_EFFORT: "Tempo work",
  STEADY_EFFORT: "Steady effort",
  TEMPO_PROGRESSIVE: "Build to tempo",
  MIXED_TEMPO: "Mixed intensity",
  ESCALATING_TEMPO: "Escalate tempo",

  // SWEET SPOT
  SWEET_SPOT: "Sweet spot",
  SWEET_SPOT_ENDURANCE: "SS endurance",
  HIGH_DENSITY_SS: "High density",

  // THRESHOLD / FTP
  FTP_WORK: "FTP effort",
  FTP_REPEATS: "FTP repeats",
  THRESHOLD_POWER: "Threshold",
  FTP_BUILD: "Build threshold",
  OVER_UNDER: "Dynamic threshold",

  // VO2MAX / AEROBIC POWER
  VO2MAX_WORK: "VO2max",
  VO2MAX_REPEATS: "VO2 repeats",
  AEROBIC_POWER: "Aerobic power",
  HIGH_INTENSITY: "High intensity",

  // ANAEROBIC / SPRINT
  ANAEROBIC_CAPACITY: "Anaerobic",
  ANAEROBIC_REPEATS: "Anaerobic repeats",
  SPRINT_POWER: "Sprint power",
  ALL_OUT_EFFORT: "All-out",
  NEUROMUSCULAR: "Neuromuscular",

  // CADENCE & TECHNICAL
  CADENCE_WORK: "Cadence work",
  PEDAL_EFFICIENCY: "Pedal efficiency",
  HIGH_CADENCE: "High cadence",
  LOW_CADENCE: "Low cadence",
  SINGLE_LEG: "Single-leg work",
  SMOOTH_PEDALING: "Smooth pedaling",

  // FTP TESTING
  FTP_TEST: "FTP test",
  FTP_ASSESSMENT: "FTP measure",
  RAMP_TEST: "Ramp test",
  BLOW_OUT: "Clear system",

  // MIXED & PROGRESSIVE
  MIXED_EFFORTS: "Mixed efforts",
  PROGRESSIVE_BUILD: "Build progression",
  PYRAMID: "Pyramid",
  LADDER: "Ladder",
  ALTERNATING: "Alternating",
  ESCALATING: "Escalating",

  // REST & RECOVERY
  REST_EASY: "Rest easy",
  ACTIVE_RECOVERY: "Active recovery",
  SPIN_OUT: "Spin out",

  // ROAD / OUTDOOR
  OUTDOOR_RIDE: "Outdoor ride",
  LONG_RIDE: "Long ride",
  VARIED_TERRAIN: "Varied terrain",
  CLIMBING: "Climbing",
  ROAD_TRAINING: "Road training",
} as const;

/**
 * INTERVAL-SPECIFIC PURPOSES - Used within structured workouts
 */
export const INTERVAL_PURPOSE = {
  // Warmup/Cooldown blocks
  GRADUAL_WARMUP: "Warm up",
  EASY_COOLDOWN: "Cool down",
  FLUSH_LACTATE: "Flush lactate",

  // Base/Endurance blocks
  Z2_STEADY: "Z2 steady",
  ENDURANCE_BLOCK: "Endurance",
  LOW_Z2: "Low Z2",
  MID_Z2: "Mid Z2",
  HIGH_Z2: "High Z2",

  // Tempo blocks
  TEMPO_BLOCK: "Tempo",
  TEMPO_BUILD: "Tempo build",
  TEMPO_PUSH: "Tempo push",
  ESCALATE_TEMPO: "Escalate tempo",

  // Sweet spot blocks
  SWEET_SPOT_BLOCK: "Sweet spot",
  SS_INTERVAL: "SS interval",
  SS_REPEAT: "SS repeat",

  // Threshold / FTP blocks
  THRESHOLD_BLOCK: "Threshold",
  FTP_INTERVAL: "FTP interval",
  FTP_REPEAT: "FTP repeat",
  ABOVE_THRESHOLD: "Above threshold",

  // VO2max blocks
  VO2MAX_INTERVAL: "VO2max",
  VO2MAX_REPEAT: "VO2 repeat",
  HIGH_AEROBIC: "High aerobic",

  // Anaerobic/Sprint blocks
  ANAEROBIC_BURST: "Anaerobic",
  SPRINT_REPEAT: "Sprint",
  MAX_EFFORT: "Max effort",
  ALL_OUT: "All-out",

  // Cadence/Technical
  HIGH_CADENCE_SPIN: "High spin",
  LOW_CADENCE_FORCE: "Force",
  PEDAL_STROKE: "Pedal stroke",

  // Rest/Recovery within sets
  REST_INTERVAL: "Rest",
  SHORT_REST: "Rest",
  LONG_REST: "Rest",
  RECOVERY_BLOCK: "Recovery",

  // Mixed/Progressive
  PROGRESSIVE_EFFORT: "Build",
  ESCALATING_EFFORT: "Escalate",
  VARIABLE_EFFORT: "Variable",
  MIXED_ZONE: "Mixed",
} as const;
