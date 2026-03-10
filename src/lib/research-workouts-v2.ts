/**
 * RESEARCH WORKOUTS VOLUME 2: Carlos's Additional 38 Workouts
 * Extracted from email (March 10, 2026)
 * 
 * Supplementary collection to Volume 1 (105 workouts)
 * Numbering continues from W106 onwards
 * All power targets are % of FTP unless noted otherwise
 */

import type { WorkoutTemplate } from './periodization';

export const RESEARCH_WORKOUTS_V2: WorkoutTemplate[] = [
  // ─── CATEGORY A: COMBO & HYBRID SESSIONS (W106-W110) ───────────────────

  // W106 – Sweet Spot into VO2max Finisher
  {
    id: 'w106',
    title: 'Sweet Spot into VO2max Finisher',
    description: 'SS depletes fuel, VO2max challenges tired legs',
    category: 'COMBO',
    duration: 75,
    zone: 'Z3',
    purpose: 'Deplete fuel reserves at sweet spot, then challenge VO2max on tired legs',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: 'Easy spin to 70%' },
      { name: 'SS Block 1', durationSecs: 720, powerLow: 90, powerHigh: 93, zone: 'Z3', rpe: 5, purpose: 'Glycogen depletion', coachNote: 'Steady at sweet spot' },
      { name: 'SS Block 2', durationSecs: 720, powerLow: 90, powerHigh: 93, zone: 'Z3', rpe: 5, purpose: 'Glycogen depletion', coachNote: 'Maintain intensity' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: 'Easy spin' },
      { name: 'VO2 Burst 1', durationSecs: 60, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'Challenge fatigued muscles', coachNote: 'Max effort on tired legs' },
      { name: 'Rest', durationSecs: 60, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: 'Barely pedaling' },
      { name: 'VO2 Burst 2', durationSecs: 60, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'Challenge fatigued muscles', coachNote: 'Again' },
      { name: 'Rest', durationSecs: 60, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: 'Recover' },
      { name: 'VO2 Burst 3', durationSecs: 60, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'Challenge fatigued muscles', coachNote: 'Final one' },
      { name: 'VO2 Burst 4', durationSecs: 60, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'Challenge fatigued muscles', coachNote: 'Push through' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: 'Spin it out' },
    ],
    protocol: 'Hybrid Combo',
    researcher: 'Carlos',
    structure: 'mixed',
    difficultyScore: 8,
  },

  // W107 – Tempo into Threshold Ramp
  {
    id: 'w107',
    title: 'Tempo into Threshold Ramp',
    description: 'Build from comfortable to painful progressively',
    category: 'TEMPO',
    duration: 70,
    zone: 'Z4',
    purpose: 'Progressive intensity escalation: pacing progression',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: 'Easy 10 min' },
      { name: 'Tempo', durationSecs: 1200, powerLow: 80, powerHigh: 80, zone: 'Z3', rpe: 6, purpose: 'Tempo effort', coachNote: 'Steady at 80%' },
      { name: 'Sweet Spot', durationSecs: 900, powerLow: 90, powerHigh: 90, zone: 'Z3', rpe: 7, purpose: 'Escalate intensity', coachNote: 'No rest between' },
      { name: 'Threshold Low', durationSecs: 600, powerLow: 98, powerHigh: 98, zone: 'Z4', rpe: 8, purpose: 'Approach FTP', coachNote: 'Getting hard' },
      { name: 'Threshold High', durationSecs: 600, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 9, purpose: 'Sustain FTP', coachNote: 'Right at threshold' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: 'Catch your breath' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: 'Spin easy' },
    ],
    protocol: 'Continuous Build',
    researcher: 'Carlos',
    structure: 'ladder',
    difficultyScore: 7,
  },

  // W108 – Endurance with Neuromuscular Bursts
  {
    id: 'w108',
    title: 'Endurance with Neuromuscular Bursts',
    description: 'Aerobic base with fast-twitch activation',
    category: 'BASE',
    duration: 90,
    zone: 'Z2',
    purpose: 'Aerobic base with neuromuscular fiber recruitment',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: 'Easy spin' },
      { name: 'Easy Block', durationSecs: 3900, powerLow: 68, powerHigh: 68, zone: 'Z2', rpe: 4, purpose: 'Aerobic base', coachNote: '65 min at easy pace' },
      // Every 5 min: 30s sprint, return to 68%
      { name: 'Sprint 1', durationSecs: 30, powerLow: 150, powerHigh: 150, zone: 'Z6', rpe: 10, purpose: 'Max effort', coachNote: 'Sprint!' },
      { name: 'Sprint 2', durationSecs: 30, powerLow: 150, powerHigh: 150, zone: 'Z6', rpe: 10, purpose: 'Max effort', coachNote: 'Again' },
      { name: 'Sprint 3', durationSecs: 30, powerLow: 150, powerHigh: 150, zone: 'Z6', rpe: 10, purpose: 'Max effort', coachNote: 'Push' },
      // ... (13 total sprints scattered through 65 min)
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: 'Spin down' },
    ],
    protocol: 'Endurance + Activators',
    researcher: 'Carlos',
    structure: 'mixed',
    difficultyScore: 5,
  },

  // W109 – Mixed Energy Systems Medley
  {
    id: 'w109',
    title: 'Mixed Energy Systems Medley',
    description: 'Touch all energy systems in ascending order',
    category: 'VO2MAX',
    duration: 80,
    zone: 'Z5',
    purpose: 'Touch all energy systems in one session',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: '10 min easy' },
      { name: 'Base Block', durationSecs: 900, powerLow: 70, powerHigh: 70, zone: 'Z2', rpe: 4, purpose: 'Endurance foundation', coachNote: '15 min at 70%' },
      { name: 'Tempo', durationSecs: 480, powerLow: 85, powerHigh: 85, zone: 'Z3', rpe: 6, purpose: 'Tempo effort', coachNote: '8 min at tempo' },
      { name: 'Sweet Spot', durationSecs: 480, powerLow: 92, powerHigh: 92, zone: 'Z3', rpe: 7, purpose: 'Sweet spot work', coachNote: '8 min at SS' },
      { name: 'Threshold', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Threshold effort', coachNote: '5 min at FTP' },
      { name: 'VO2max', durationSecs: 180, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2 push', coachNote: '3 min VO2' },
      { name: 'Sprint', durationSecs: 30, powerLow: 150, powerHigh: 150, zone: 'Z6', rpe: 10, purpose: 'Peak power', coachNote: '10s sprint' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: 'Recover' },
    ],
    protocol: 'Energy Spectrum',
    researcher: 'Carlos',
    structure: 'mixed',
    difficultyScore: 8,
  },

  // W110 – Gravel Unbound Simulation
  {
    id: 'w110',
    title: 'Gravel Unbound Simulation',
    description: 'Variable power with surges simulating gravel racing',
    category: 'ANAEROBIC',
    duration: 90,
    zone: 'Z4',
    purpose: 'Simulate unpredictable nature of gravel racing',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: '10 min' },
      { name: 'Base Road', durationSecs: 480, powerLow: 75, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Gravel road pace', coachNote: '8 min steady' },
      { name: 'Hill Surge', durationSecs: 30, powerLow: 130, powerHigh: 130, zone: 'Z5', rpe: 9, purpose: 'Attack over hill', coachNote: 'Hard 30s' },
      { name: 'Settle', durationSecs: 240, powerLow: 80, powerHigh: 80, zone: 'Z3', rpe: 5, purpose: 'Return to pace', coachNote: '4 min return' },
      { name: 'Another Surge', durationSecs: 30, powerLow: 140, powerHigh: 140, zone: 'Z5', rpe: 9, purpose: 'Attack again', coachNote: '30s' },
      // Pattern repeats 3x
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min spin' },
    ],
    protocol: 'Gravel Race Sim',
    researcher: 'Carlos',
    structure: 'mixed',
    difficultyScore: 7,
  },

  // ─── CATEGORY B: VO2MAX LADDERS & PYRAMIDS (W111-W114) ────────────────

  // W111 – VO2max Ladder (Wattbike Style)
  {
    id: 'w111',
    title: 'VO2max Ladder (Wattbike Style)',
    description: 'Progressive intensity across all aerobic zones',
    category: 'VO2MAX',
    duration: 65,
    zone: 'Z5',
    purpose: 'Progressive intensity across all aerobic zones',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: '10 min' },
      { name: 'Ladder Step 1', durationSecs: 600, powerLow: 80, powerHigh: 80, zone: 'Z3', rpe: 6, purpose: 'Base', coachNote: '10 min at 80%' },
      { name: 'Rest', durationSecs: 120, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Ladder Step 2', durationSecs: 480, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP', coachNote: '8 min at 100%' },
      { name: 'Rest', durationSecs: 120, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Ladder Step 3', durationSecs: 360, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '6 min at 110%' },
      { name: 'Rest', durationSecs: 120, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Ladder Step 4', durationSecs: 240, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'Peak VO2', coachNote: '4 min at 115%' },
      { name: 'Rest', durationSecs: 120, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Ladder Step 5', durationSecs: 120, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'Max', coachNote: '2 min at 120%' },
      { name: 'Cool-down', durationSecs: 300, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '5 min cool' },
    ],
    protocol: 'VO2 Ladder',
    researcher: 'Nichols/Wattbike',
    structure: 'ladder',
    difficultyScore: 9,
  },

  // W112 – Inverted VO2max Ladder
  {
    id: 'w112',
    title: 'Inverted VO2max Ladder',
    description: 'Hardest effort first, then sustain quality as intensity drops',
    category: 'VO2MAX',
    duration: 65,
    zone: 'Z5',
    purpose: 'Hardest first, sustain quality on fatigue',
    intervals: () => [
      { name: 'Warm-up Extended', durationSecs: 900, powerLow: 50, powerHigh: 80, zone: 'Z2', rpe: 4, purpose: 'Prime system', coachNote: '15 min progressive, include 2x 20s at 110%' },
      { name: 'Hard Step 1', durationSecs: 120, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'Max power', coachNote: '2 min at 120%' },
      { name: 'Rest', durationSecs: 120, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Step 2', durationSecs: 180, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '3 min at 115%' },
      { name: 'Rest', durationSecs: 120, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Step 3', durationSecs: 240, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '4 min at 110%' },
      { name: 'Rest', durationSecs: 120, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Step 4', durationSecs: 300, powerLow: 105, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'Sustained', coachNote: '5 min at 105%' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'Inverted Ladder',
    researcher: 'Carlos',
    structure: 'ladder',
    difficultyScore: 9,
  },

  // W113 – 1-2-3-4-3-2-1 Pyramid
  {
    id: 'w113',
    title: '1-2-3-4-3-2-1 Pyramid',
    description: 'Multi-duration VO2max pyramid',
    category: 'VO2MAX',
    duration: 60,
    zone: 'Z5',
    purpose: 'Multi-duration VO2 pyramid work',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: '10 min' },
      { name: 'Pyramid 1min', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'VO2', coachNote: '1 min at 120%' },
      { name: 'Pyramid 2min', durationSecs: 120, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '2 min at 115%' },
      { name: 'Pyramid 3min', durationSecs: 180, powerLow: 112, powerHigh: 112, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '3 min at 112%' },
      { name: 'Pyramid 4min', durationSecs: 240, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 9, purpose: 'Peak', coachNote: '4 min at 110%' },
      { name: 'Pyramid 3min Down', durationSecs: 180, powerLow: 112, powerHigh: 112, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '3 min descent' },
      { name: 'Pyramid 2min Down', durationSecs: 120, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '2 min descent' },
      { name: 'Pyramid 1min Down', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'Peak', coachNote: '1 min at top' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'VO2 Pyramid',
    researcher: 'Carlos',
    structure: 'pyramid',
    difficultyScore: 9,
  },

  // W114 – Double Pyramid
  {
    id: 'w114',
    title: 'Double Pyramid',
    description: 'Two pyramids with recovery between',
    category: 'VO2MAX',
    duration: 75,
    zone: 'Z5',
    purpose: 'Two pyramid sets with recovery',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build gradually', coachNote: '10 min' },
      // Pyramid 1
      { name: 'P1-1min', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'VO2', coachNote: '1 min' },
      { name: 'P1-2min', durationSecs: 120, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '2 min' },
      { name: 'P1-3min', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 9, purpose: 'Peak', coachNote: '3 min' },
      { name: 'P1-2min', durationSecs: 120, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '2 min down' },
      { name: 'P1-1min', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'Peak', coachNote: '1 min' },
      // Recovery
      { name: 'Recovery', durationSecs: 480, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Full recovery', coachNote: '8 min rest' },
      // Pyramid 2 (same structure)
      { name: 'P2-1min', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'VO2', coachNote: '1 min' },
      { name: 'P2-2min', durationSecs: 120, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '2 min' },
      { name: 'P2-3min', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 9, purpose: 'Peak', coachNote: '3 min' },
      { name: 'P2-2min', durationSecs: 120, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: 'VO2', coachNote: '2 min down' },
      { name: 'P2-1min', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 10, purpose: 'Peak', coachNote: '1 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'Double Pyramid',
    researcher: 'Carlos',
    structure: 'pyramid',
    difficultyScore: 9,
  },

  // ─── CATEGORY C: NAMED/FAMOUS WORKOUTS (W115-W122) ───────────────────────

  // W115 – The Wringer (Zwift)
  {
    id: 'w115',
    title: 'The Wringer (Zwift)',
    description: 'Anaerobic power with decreasing recovery',
    category: 'ANAEROBIC',
    duration: 45,
    zone: 'Z6',
    purpose: 'Anaerobic power with decreasing recovery',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 720, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 3, purpose: 'Progressive', coachNote: '12 min progressive ramp' },
      { name: 'Work 1', durationSecs: 30, powerLow: 200, powerHigh: 205, zone: 'Z6', rpe: 10, purpose: '200-205%', coachNote: '30s at max power' },
      { name: 'Work 2', durationSecs: 30, powerLow: 200, powerHigh: 205, zone: 'Z6', rpe: 10, purpose: '200-205%', coachNote: '30s repeats' },
      { name: 'Work 3', durationSecs: 30, powerLow: 200, powerHigh: 205, zone: 'Z6', rpe: 10, purpose: '200-205%', coachNote: '...' },
      // Recovery decreases each interval
      { name: 'Cool-down', durationSecs: 480, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '8 min cool' },
    ],
    protocol: 'Zwift Famous',
    researcher: 'Zwift',
    structure: 'repeats',
    difficultyScore: 10,
  },

  // W116 – The Gorby (Zwift)
  {
    id: 'w116',
    title: 'The Gorby (Zwift)',
    description: 'Sustained VO2max endurance',
    category: 'VO2MAX',
    duration: 60,
    zone: 'Z5',
    purpose: 'Sustained VO2max endurance',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 75, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Block 1', durationSecs: 540, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: '115%', coachNote: '3 min at 115%' },
      { name: 'Block 1 Mid', durationSecs: 540, powerLow: 88, powerHigh: 88, zone: 'Z3', rpe: 5, purpose: '88%', coachNote: '3 min at 88%' },
      { name: 'Block 1 High', durationSecs: 540, powerLow: 115, powerHigh: 115, zone: 'Z5', rpe: 9, purpose: '115%', coachNote: '3 min at 115%' },
      // Repeat pattern 3x with 5 min rest between
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'Zwift Famous',
    researcher: 'Zwift',
    structure: 'mixed',
    difficultyScore: 9,
  },

  // W117 – The McCarthy Special (Zwift)
  {
    id: 'w117',
    title: 'The McCarthy Special (Zwift)',
    description: 'Threshold endurance with VO2 surges',
    category: 'THRESHOLD',
    duration: 60,
    zone: 'Z4',
    purpose: 'Threshold endurance with VO2 surges',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 75, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'TH Block 1', durationSecs: 900, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: '95% FTP', coachNote: '15 min' },
      { name: 'Surge 1', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: 'VO2 kick', coachNote: '1 min at 120%' },
      { name: 'TH Block 2', durationSecs: 900, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: '95% FTP', coachNote: '15 min' },
      { name: 'Surge 2', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: 'VO2 kick', coachNote: '1 min at 120%' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'Zwift Famous',
    researcher: 'Zwift',
    structure: 'mixed',
    difficultyScore: 9,
  },

  // W118 – Baird (TrainerRoad Style)
  {
    id: 'w118',
    title: 'Baird (TrainerRoad Style)',
    description: 'Short sharp VO2max repeats with long recovery',
    category: 'VO2MAX',
    duration: 60,
    zone: 'Z5',
    purpose: 'Short VO2max repeats with full recovery',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      // 5x1min at 120% with 1 min rest
      { name: 'VO2 Rep 1', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: '120%', coachNote: '1 min hard' },
      { name: 'Rest 1', durationSecs: 60, powerLow: 40, powerHigh: 40, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '1 min rest' },
      { name: 'VO2 Rep 2', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: '120%', coachNote: '1 min hard' },
      { name: 'Rest 2', durationSecs: 60, powerLow: 40, powerHigh: 40, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '1 min rest' },
      { name: 'VO2 Rep 3', durationSecs: 60, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: '120%', coachNote: '1 min hard' },
      // ... 5 total
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'TrainerRoad',
    researcher: 'TrainerRoad',
    structure: 'repeats',
    difficultyScore: 8,
  },

  // W119 – Spencer (TrainerRoad Style)
    // W120 – Kaiser (TrainerRoad Style)
  {
    id: 'w120',
    title: 'Kaiser (TrainerRoad Style)',
    description: 'Extended Spencer – more VO2max volume',
    category: 'VO2MAX',
    duration: 65,
    zone: 'Z5',
    purpose: 'Extended Spencer for max VO2 volume',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      // 6x3min at 120% with 3 min rest
      { name: 'VO2 Rep 1', durationSecs: 180, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: '120%', coachNote: '3 min hard' },
      { name: 'Rest', durationSecs: 180, powerLow: 40, powerHigh: 40, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min rest' },
      // ... 6 total
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'TrainerRoad',
    researcher: 'TrainerRoad',
    structure: 'repeats',
    difficultyScore: 8,
  },

  // W121 – Carson (TrainerRoad Style Sweet Spot)
  {
    id: 'w121',
    title: 'Carson (TrainerRoad Style Sweet Spot)',
    description: 'Sweet spot with short threshold kicks',
    category: 'SWEET_SPOT',
    duration: 75,
    zone: 'Z3',
    purpose: 'Sweet spot with periodic threshold kicks',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      // 3x15min at 88-92% with kicks every 5 min
      { name: 'SS Block 1', durationSecs: 900, powerLow: 88, powerHigh: 92, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '15 min' },
      { name: 'SS Block 1 Kick', durationSecs: 15, powerLow: 100, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'Quick kick', coachNote: '15s surge' },
      // Pattern continues
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'TrainerRoad',
    researcher: 'TrainerRoad',
    structure: 'mixed',
    difficultyScore: 7,
  },

  // W122 – Eclipse (TrainerRoad Style)
  {
    id: 'w122',
    title: 'Eclipse (TrainerRoad Style)',
    description: 'Classic 2x20 sweet spot',
    category: 'SWEET_SPOT',
    duration: 70,
    zone: 'Z3',
    purpose: '40 min total sweet spot time',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'SS Block 1', durationSecs: 1200, powerLow: 88, powerHigh: 92, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '20 min at SS' },
      { name: 'Rest', durationSecs: 600, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min rest' },
      { name: 'SS Block 2', durationSecs: 1200, powerLow: 88, powerHigh: 92, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '20 min at SS' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min cool' },
    ],
    protocol: 'TrainerRoad',
    researcher: 'TrainerRoad',
    structure: 'repeats',
    difficultyScore: 7,
  },

  // ─── CATEGORY D: PROGRESSIVE OVERLOAD SERIES (W123-W125) ─────────────────

  // W123a, W123b, W123c, W123d – Sweet Spot Progression (4 weeks)
  {
    id: 'w123a',
    title: 'SS Progression Week 1',
    description: '3x10 min at 88% FTP',
    category: 'SWEET_SPOT',
    duration: 65,
    zone: 'Z3',
    purpose: 'Week 1 of 4-week sweet spot ramp',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'SS 1', durationSecs: 600, powerLow: 88, powerHigh: 88, zone: 'Z3', rpe: 6, purpose: 'Sweet spot', coachNote: '10 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS 2', durationSecs: 600, powerLow: 88, powerHigh: 88, zone: 'Z3', rpe: 6, purpose: 'Sweet spot', coachNote: '10 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS 3', durationSecs: 600, powerLow: 88, powerHigh: 88, zone: 'Z3', rpe: 6, purpose: 'Sweet spot', coachNote: '10 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 6,
  },

  {
    id: 'w123b',
    title: 'SS Progression Week 2',
    description: '3x12 min at 90% FTP',
    category: 'SWEET_SPOT',
    duration: 71,
    zone: 'Z3',
    purpose: 'Week 2: increased duration + intensity',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'SS 1', durationSecs: 720, powerLow: 90, powerHigh: 90, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '12 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS 2', durationSecs: 720, powerLow: 90, powerHigh: 90, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '12 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS 3', durationSecs: 720, powerLow: 90, powerHigh: 90, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '12 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 7,
  },

  {
    id: 'w123c',
    title: 'SS Progression Week 3',
    description: '3x15 min at 91% FTP',
    category: 'SWEET_SPOT',
    duration: 80,
    zone: 'Z3',
    purpose: 'Week 3: longer intervals at higher intensity',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'SS 1', durationSecs: 900, powerLow: 91, powerHigh: 91, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '15 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS 2', durationSecs: 900, powerLow: 91, powerHigh: 91, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '15 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS 3', durationSecs: 900, powerLow: 91, powerHigh: 91, zone: 'Z3', rpe: 7, purpose: 'Sweet spot', coachNote: '15 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 7,
  },

  {
    id: 'w123d',
    title: 'SS Progression Week 4 – TEST',
    description: '2x20 min at 92% FTP',
    category: 'SWEET_SPOT',
    duration: 80,
    zone: 'Z3',
    purpose: 'Week 4: extended work at higher intensity (test)',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'SS Test 1', durationSecs: 1200, powerLow: 92, powerHigh: 92, zone: 'Z3', rpe: 8, purpose: 'Extended work', coachNote: '20 min' },
      { name: 'Rest', durationSecs: 600, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min' },
      { name: 'SS Test 2', durationSecs: 1200, powerLow: 92, powerHigh: 92, zone: 'Z3', rpe: 8, purpose: 'Extended work', coachNote: '20 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 8,
  },

  // W124a-d: VO2max Progression (similar 4-week ramp)
  {
    id: 'w124a',
    title: 'VO2 Progression Week 1',
    description: '5x3 min at 110% FTP',
    category: 'VO2MAX',
    duration: 60,
    zone: 'Z5',
    purpose: 'Week 1 of 4-week VO2 ramp',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'VO2 1', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 9, purpose: 'VO2 effort', coachNote: '3 min' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      // ... 5 total
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 9,
  },

    {
    id: 'w124c',
    title: 'VO2 Progression Week 3',
    description: '4x5 min at 112% FTP',
    category: 'VO2MAX',
    duration: 70,
    zone: 'Z5',
    purpose: 'Week 3: higher intensity, fewer reps',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'VO2 1', durationSecs: 300, powerLow: 112, powerHigh: 112, zone: 'Z5', rpe: 9, purpose: 'VO2 effort', coachNote: '5 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      // ... 4 total
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 9,
  },

  {
    id: 'w124d',
    title: 'VO2 Progression Week 4 – TEST',
    description: '4x6 min at 108% FTP',
    category: 'VO2MAX',
    duration: 70,
    zone: 'Z5',
    purpose: 'Week 4: 24 min total VO2 time (test)',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'VO2 1', durationSecs: 360, powerLow: 108, powerHigh: 108, zone: 'Z5', rpe: 9, purpose: 'VO2 effort', coachNote: '6 min' },
      { name: 'Rest', durationSecs: 240, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '4 min' },
      // ... 4 total
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 9,
  },

  // W125a-d: Threshold Progression (4 weeks)
  {
    id: 'w125a',
    title: 'TH Progression Week 1',
    description: '3x10 min at 95% FTP',
    category: 'THRESHOLD',
    duration: 65,
    zone: 'Z4',
    purpose: 'Week 1 of 4-week threshold ramp',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'TH 1', durationSecs: 600, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 7, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'TH 2', durationSecs: 600, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 7, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'TH 3', durationSecs: 600, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 7, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 8,
  },

  {
    id: 'w125b',
    title: 'TH Progression Week 2',
    description: '3x12 min at 97% FTP',
    category: 'THRESHOLD',
    duration: 71,
    zone: 'Z4',
    purpose: 'Week 2: increased duration + intensity',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'TH 1', durationSecs: 720, powerLow: 97, powerHigh: 97, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '12 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'TH 2', durationSecs: 720, powerLow: 97, powerHigh: 97, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '12 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'TH 3', durationSecs: 720, powerLow: 97, powerHigh: 97, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '12 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 8,
  },

  {
    id: 'w125c',
    title: 'TH Progression Week 3',
    description: '2x18 min at 98% FTP',
    category: 'THRESHOLD',
    duration: 72,
    zone: 'Z4',
    purpose: 'Week 3: extended single blocks',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'TH 1', durationSecs: 1080, powerLow: 98, powerHigh: 98, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '18 min' },
      { name: 'Rest', durationSecs: 480, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '8 min' },
      { name: 'TH 2', durationSecs: 1080, powerLow: 98, powerHigh: 98, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '18 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 8,
  },

  {
    id: 'w125d',
    title: 'TH Progression Week 4 – TEST',
    description: '2x20 min at 100% FTP',
    category: 'THRESHOLD',
    duration: 78,
    zone: 'Z4',
    purpose: 'Week 4: classic 2x20 FTP test',
    intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 65, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min' },
      { name: 'TH Test 1', durationSecs: 1200, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 9, purpose: 'FTP effort', coachNote: '20 min' },
      { name: 'Rest', durationSecs: 600, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min' },
      { name: 'TH Test 2', durationSecs: 1200, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 9, purpose: 'FTP effort', coachNote: '20 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 2, purpose: 'Easy recovery', coachNote: '10 min' },
    ],
    protocol: '4-Week Ramp',
    researcher: 'Carlos',
    structure: 'repeats',
    difficultyScore: 8,
  },

  // ─── CATEGORY E: AT/OVER THRESHOLD WITH SURGES (W126-W128) ──────────────

  { id: 'w126', title: 'FTP with 30s Bursts', description: 'FTP durability with race-like surges', category: 'THRESHOLD', duration: 75, zone: 'Z4', purpose: 'Sustain FTP with periodic surges', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Prepare', coachNote: '10 min easy' },
      { name: 'FTP Block 1', durationSecs: 1800, powerLow: 95, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'FTP work', coachNote: '30 min at FTP' },
      { name: 'Rest', durationSecs: 600, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' },
      { name: 'FTP + Surges', durationSecs: 1200, powerLow: 95, powerHigh: 130, zone: 'Z5', rpe: 9, purpose: 'Surges on FTP', coachNote: '20 min with 30s hard every 5 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Threshold+', researcher: 'Carlos', structure: 'mixed', difficultyScore: 8 },
  { id: 'w127', title: 'Threshold with Declining Rest', description: 'Lactate tolerance under increasing pressure', category: 'THRESHOLD', duration: 70, zone: 'Z4', purpose: 'Lactate clearance with decreasing recovery', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Prepare', coachNote: '10 min easy' },
      { name: 'TH Rep 1', durationSecs: 600, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Rest 1', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'TH Rep 2', durationSecs: 600, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Rest 2', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'TH Rep 3', durationSecs: 600, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Threshold+', researcher: 'Carlos', structure: 'mixed', difficultyScore: 8 },
  { id: 'w128', title: 'VO2max Surge on Threshold', description: 'VO2max intervals layered over FTP base', category: 'VO2MAX', duration: 70, zone: 'Z5', purpose: 'VO2 intervals with high lactate baseline', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Prepare', coachNote: '10 min easy' },
      { name: 'FTP Base', durationSecs: 1200, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'FTP foundation', coachNote: '20 min at FTP' },
      { name: 'VO2 Surge', durationSecs: 120, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: 'VO2 kick', coachNote: '2 min surge' },
      { name: 'Return', durationSecs: 600, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'Back to FTP', coachNote: '10 min' },
      { name: 'VO2 Surge 2', durationSecs: 120, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: 'VO2 kick', coachNote: '2 min surge' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Threshold+', researcher: 'EVOQ', structure: 'mixed', difficultyScore: 9 },

  // ─── CATEGORY F: ENDURANCE VARIANTS (W129-W131) ───────────────────────

  { id: 'w129', title: 'Café Ride with Purpose', description: 'Social endurance ride with structured blocks', category: 'BASE', duration: 120, zone: 'Z2', purpose: 'Group dynamics with training value', intervals: () => [
      { name: 'Easy Start', durationSecs: 2400, powerLow: 60, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Group warmup', coachNote: '40 min easy conversational' },
      { name: 'Tempo Block', durationSecs: 1800, powerLow: 80, powerHigh: 85, zone: 'Z3', rpe: 6, purpose: 'Mixed pace', coachNote: '30 min tempo' },
      { name: 'Final Easy', durationSecs: 2400, powerLow: 60, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Social finish', coachNote: '40 min easy' }
    ], protocol: 'Social Endurance', researcher: 'Carlos', structure: 'mixed', difficultyScore: 4 },
  { id: 'w130', title: '3-Hour Endurance Foundation', description: 'Pure aerobic base for event prep', category: 'BASE', duration: 180, zone: 'Z2', purpose: 'Long aerobic capacity building', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Steady Endurance', durationSecs: 9600, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Aerobic base', coachNote: '160 min easy' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Long Steady', researcher: 'Seiler', structure: 'steady', difficultyScore: 3 },
  { id: 'w131', title: 'Endurance with Tempo Climbs', description: 'Simulate undulating terrain endurance ride', category: 'BASE', duration: 120, zone: 'Z3', purpose: 'Muscular endurance on varied terrain', intervals: () => [
      { name: 'Easy Start', durationSecs: 1800, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Warmup', coachNote: '30 min easy' },
      { name: 'Climb 1', durationSecs: 900, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Climb effort', coachNote: '15 min tempo' },
      { name: 'Easy 1', durationSecs: 1200, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Recovery', coachNote: '20 min easy' },
      { name: 'Climb 2', durationSecs: 900, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Climb effort', coachNote: '15 min tempo' },
      { name: 'Easy 2', durationSecs: 1200, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Recovery', coachNote: '20 min easy' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Undulating', researcher: 'Carlos', structure: 'mixed', difficultyScore: 5 },

  // ─── CATEGORY G: ANAEROBIC & SPRINT VARIANTS (W132-W135) ───────────────

  { id: 'w132', title: 'The Wringer Light', description: 'Anaerobic repeats with decreasing rest (accessible)', category: 'ANAEROBIC', duration: 50, zone: 'Z6', purpose: 'Anaerobic training with lower volume', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Anaerobic 1', durationSecs: 30, powerLow: 180, powerHigh: 190, zone: 'Z6', rpe: 10, purpose: 'Max power', coachNote: '30s hard' },
      { name: 'Rest 1', durationSecs: 180, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min rest' },
      { name: 'Anaerobic 2', durationSecs: 30, powerLow: 180, powerHigh: 190, zone: 'Z6', rpe: 10, purpose: 'Max power', coachNote: '30s hard' },
      { name: 'Rest 2', durationSecs: 120, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Anaerobic 3', durationSecs: 30, powerLow: 180, powerHigh: 190, zone: 'Z6', rpe: 10, purpose: 'Max power', coachNote: '30s hard' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Anaerobic', researcher: 'Carlos', structure: 'repeats', difficultyScore: 8 },
  { id: 'w133', title: 'Sprint Ladder', description: 'Full-spectrum sprint development', category: 'SPRINT', duration: 55, zone: 'Z6', purpose: 'Multi-duration sprint training', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Sprint 10s', durationSecs: 10, powerLow: 200, powerHigh: 220, zone: 'Z7', rpe: 10, purpose: 'Max sprint', coachNote: '10s' },
      { name: 'Rest', durationSecs: 180, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Sprint 20s', durationSecs: 20, powerLow: 180, powerHigh: 200, zone: 'Z6', rpe: 10, purpose: 'Sprint', coachNote: '20s' },
      { name: 'Rest', durationSecs: 180, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Sprint 30s', durationSecs: 30, powerLow: 160, powerHigh: 180, zone: 'Z6', rpe: 9, purpose: 'Sprint', coachNote: '30s' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Sprint Ladder', researcher: 'Carlos', structure: 'ladder', difficultyScore: 7 },
  { id: 'w134', title: '20/40 Anaerobic Repeats', description: 'High power density with moderate recovery', category: 'ANAEROBIC', duration: 55, zone: 'Z6', purpose: 'Peak power repeatability', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: '20s Hard', durationSecs: 20, powerLow: 150, powerHigh: 160, zone: 'Z6', rpe: 10, purpose: 'Hard effort', coachNote: '20s' },
      { name: '40s Easy', durationSecs: 40, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '40s easy' },
      { name: '20s Hard 2', durationSecs: 20, powerLow: 150, powerHigh: 160, zone: 'Z6', rpe: 10, purpose: 'Hard effort', coachNote: '20s' },
      { name: '40s Easy 2', durationSecs: 40, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '40s easy' },
      { name: '20s Hard 3', durationSecs: 20, powerLow: 150, powerHigh: 160, zone: 'Z6', rpe: 10, purpose: 'Hard effort', coachNote: '20s' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Anaerobic', researcher: 'Carlos', structure: 'repeats', difficultyScore: 8 },
  { id: 'w135', title: 'Standing Power Intervals', description: 'Out-of-saddle power and recruitment', category: 'ANAEROBIC', duration: 60, zone: 'Z5', purpose: 'Climbing and attack power', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Standing 1', durationSecs: 120, powerLow: 130, powerHigh: 140, zone: 'Z5', rpe: 9, purpose: 'Out of saddle', coachNote: '2 min standing' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Standing 2', durationSecs: 120, powerLow: 130, powerHigh: 140, zone: 'Z5', rpe: 9, purpose: 'Out of saddle', coachNote: '2 min standing' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Standing 3', durationSecs: 120, powerLow: 130, powerHigh: 140, zone: 'Z5', rpe: 9, purpose: 'Out of saddle', coachNote: '2 min standing' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Standing Power', researcher: 'Carlos', structure: 'repeats', difficultyScore: 8 },

  // ─── CATEGORY H: MUSCULAR ENDURANCE & LOW CADENCE (W136-W138) ─────────

  { id: 'w136', title: 'Force-Velocity Contrast', description: 'Alternate high-torque and high-spin at same power', category: 'SWEET_SPOT', duration: 70, zone: 'Z3', purpose: 'Force across full RPM spectrum', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Low Cadence (80%)', durationSecs: 600, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Force', coachNote: '10 min low cadence' },
      { name: 'High Cadence (85%)', durationSecs: 600, powerLow: 80, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Speed', coachNote: '10 min high cadence' },
      { name: 'Low Cadence 2', durationSecs: 600, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Force', coachNote: '10 min low cadence' },
      { name: 'High Cadence 2', durationSecs: 600, powerLow: 80, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Speed', coachNote: '10 min high cadence' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Force-Velocity', researcher: 'Carlos', structure: 'mixed', difficultyScore: 7 },
  { id: 'w137', title: 'Low-Cadence Threshold', description: 'Climbing-specific FTP development', category: 'THRESHOLD', duration: 70, zone: 'Z4', purpose: 'Steep gradient FTP work', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Low Cadence FTP 1', durationSecs: 900, powerLow: 95, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'Climb strength', coachNote: '15 min climbing effort' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' },
      { name: 'Low Cadence FTP 2', durationSecs: 900, powerLow: 95, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'Climb strength', coachNote: '15 min climbing effort' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Low Cadence', researcher: 'Paton/Hopkins', structure: 'repeats', difficultyScore: 8 },
  { id: 'w138', title: 'Seated/Standing Alternation', description: 'Position-specific power development', category: 'THRESHOLD', duration: 65, zone: 'Z4', purpose: 'Transition power without loss', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Seated', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP seated', coachNote: '5 min seated' },
      { name: 'Standing', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP standing', coachNote: '5 min standing' },
      { name: 'Seated 2', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP seated', coachNote: '5 min seated' },
      { name: 'Standing 2', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP standing', coachNote: '5 min standing' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Position Shifts', researcher: 'Carlos', structure: 'mixed', difficultyScore: 7 },

  // ─── CATEGORY I: MASTERS-SPECIFIC SESSIONS (W139-W141) ────────────────

  { id: 'w139', title: 'Masters VO2max (Conservative)', description: 'VO2 stimulus with extended warm-up', category: 'VO2MAX', duration: 70, zone: 'Z5', purpose: 'Age-appropriate VO2 training', intervals: () => [
      { name: 'Warm-up Extended', durationSecs: 900, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Extended warmup', coachNote: '15 min easy + progressions' },
      { name: 'VO2 Rep 1', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 8, purpose: 'VO2', coachNote: '3 min' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'VO2 Rep 2', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 8, purpose: 'VO2', coachNote: '3 min' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'VO2 Rep 3', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 8, purpose: 'VO2', coachNote: '3 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Masters', researcher: 'Carlos', structure: 'repeats', difficultyScore: 8 },
  { id: 'w140', title: 'Masters Sweet Spot', description: 'FTP development with recovery-friendly load', category: 'SWEET_SPOT', duration: 75, zone: 'Z3', purpose: 'Consistent execution over aggressive targets', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'SS Block 1', durationSecs: 1200, powerLow: 88, powerHigh: 92, zone: 'Z3', rpe: 6, purpose: 'Sweet spot', coachNote: '20 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS Block 2', durationSecs: 1200, powerLow: 88, powerHigh: 92, zone: 'Z3', rpe: 6, purpose: 'Sweet spot', coachNote: '20 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Masters', researcher: 'Carlos', structure: 'repeats', difficultyScore: 6 },
  { id: 'w141', title: 'Masters Tempo Endurance', description: 'Aerobic endurance with moderate stress', category: 'TEMPO', duration: 90, zone: 'Z3', purpose: 'Zone 3 sweet spot for masters', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Tempo', durationSecs: 3600, powerLow: 78, powerHigh: 88, zone: 'Z3', rpe: 6, purpose: 'Zone 3', coachNote: '60 min steady tempo' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Masters', researcher: 'Carlos', structure: 'steady', difficultyScore: 5 },

  // ─── CATEGORY J: PRE-RACE / TAPER WORKOUTS (W142-W143) ──────────────

  { id: 'w142', title: 'Race Eve Sharpener', description: 'Final activation the day before racing', category: 'SPRINT', duration: 30, zone: 'Z3', purpose: 'Nervous system priming', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Activation Surge 1', durationSecs: 30, powerLow: 130, powerHigh: 130, zone: 'Z5', rpe: 8, purpose: 'Nerve activation', coachNote: '30s hard' },
      { name: 'Easy', durationSecs: 180, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Easy', coachNote: '3 min easy' },
      { name: 'Activation Surge 2', durationSecs: 30, powerLow: 130, powerHigh: 130, zone: 'Z5', rpe: 8, purpose: 'Nerve activation', coachNote: '30s hard' },
      { name: 'Cool-down', durationSecs: 300, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' }
    ], protocol: 'Taper', researcher: 'Carlos', structure: 'mixed', difficultyScore: 3 },
  { id: 'w143a', title: '3-Day Taper Sequence Day 1', description: '60 min: 10 easy + 20 at 85% + 2x5 at 95%/55% + 10 CD', category: 'TEMPO', duration: 60, zone: 'Z3', purpose: '3-day pre-race sequence, day 1', intervals: () => [
      { name: 'Easy Start', durationSecs: 600, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Warmup', coachNote: '10 min easy' },
      { name: 'Tempo', durationSecs: 1200, powerLow: 80, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Tempo work', coachNote: '20 min at 85%' },
      { name: 'Hard 1', durationSecs: 300, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'FTP', coachNote: '5 min hard' },
      { name: 'Easy 1', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' },
      { name: 'Hard 2', durationSecs: 300, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'FTP', coachNote: '5 min hard' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Taper', researcher: 'Carlos', structure: 'mixed', difficultyScore: 4 },
  { id: 'w143b', title: '3-Day Taper Sequence Day 2', description: '45 min: 10 easy + 15 at 70% + 3x1 at 100% + 10 CD', category: 'THRESHOLD', duration: 45, zone: 'Z3', purpose: '3-day pre-race sequence, day 2', intervals: () => [
      { name: 'Easy Start', durationSecs: 600, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Warmup', coachNote: '10 min easy' },
      { name: 'Base', durationSecs: 900, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Steady', coachNote: '15 min at 70%' },
      { name: 'Sprint 1', durationSecs: 60, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Activation', coachNote: '1 min' },
      { name: 'Sprint 2', durationSecs: 60, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Activation', coachNote: '1 min' },
      { name: 'Sprint 3', durationSecs: 60, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Activation', coachNote: '1 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ], protocol: 'Taper', researcher: 'Carlos', structure: 'mixed', difficultyScore: 3 },
  { id: 'w143c', title: '3-Day Taper Sequence Day 3 (Race Eve)', description: '30 min: W142 sharpener', category: 'SPRINT', duration: 30, zone: 'Z2', purpose: '3-day pre-race sequence, day 3 (race eve)', intervals: () => [
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Surge 1', durationSecs: 20, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 8, purpose: 'Nerve prime', coachNote: '20s hard' },
      { name: 'Easy 1', durationSecs: 180, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Easy', coachNote: '3 min easy' },
      { name: 'Surge 2', durationSecs: 20, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 8, purpose: 'Nerve prime', coachNote: '20s hard' },
      { name: 'Cool-down', durationSecs: 300, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' }
    ], protocol: 'Taper', researcher: 'Carlos', structure: 'mixed', difficultyScore: 2 },

];
