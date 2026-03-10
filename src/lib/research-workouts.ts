/**
 * RESEARCH WORKOUTS: Carlos's 105-Workout Database
 * Extracted from email (March 9, 2026)
 * 
 * These are research-backed structured interval workouts
 * for indoor and outdoor cycling, organized by energy system
 * and training goal. All power targets are % of FTP.
 */

import type { WorkoutTemplate } from './periodization';

// Research workouts (W001-W105)
export const RESEARCH_WORKOUTS: WorkoutTemplate[] = [

  // W001 – Steady State Endurance
  {
    id: 'w001',
    title: 'Steady State Endurance',
    category: 'BASE',
    description: 'Aerobic base building, fat oxidation',
    purpose: 'Aerobic base building, fat oxidation',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Aerobic base building, fat oxidation' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Aerobic base building, fat oxidation' }
    ],
  },

  // W002 – Long Endurance Ride
  {
    id: 'w002',
    title: 'Long Endurance Ride',
    category: 'BASE',
    description: 'Extended aerobic development',
    purpose: 'Extended aerobic development',
    zone: 'Z1-Z2',
    duration: 150,
    difficultyScore: 9,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Extended aerobic development' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 900, coachNote: 'Easy recovery spinning', purpose: 'Extended aerobic development' }
    ],
  },

  // W003 – Tempo Sprinkle Endurance
  {
    id: 'w003',
    title: 'Tempo Sprinkle Endurance',
    category: 'BASE',
    description: 'Aerobic base with tempo touches',
    purpose: 'Aerobic base with tempo touches',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Aerobic base with tempo touches' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 900, coachNote: '68% FTP', purpose: 'Aerobic base with tempo touches' },
      { name: '82% effort', zone: 'Z3', powerLow: 77, powerHigh: 87, durationSecs: 300, coachNote: '82% FTP', purpose: 'Aerobic base with tempo touches' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 900, coachNote: '68% FTP', purpose: 'Aerobic base with tempo touches' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 300, coachNote: '85% FTP', purpose: 'Aerobic base with tempo touches' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 900, coachNote: '68% FTP', purpose: 'Aerobic base with tempo touches' },
      { name: '82% effort', zone: 'Z3', powerLow: 77, powerHigh: 87, durationSecs: 300, coachNote: '82% FTP', purpose: 'Aerobic base with tempo touches' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 600, coachNote: '68% FTP', purpose: 'Aerobic base with tempo touches' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Aerobic base with tempo touches' }
    ],
  },

  // W004 – Cadence Pyramids
  {
    id: 'w004',
    title: 'Cadence Pyramids',
    category: 'BASE',
    description: 'Neuromuscular efficiency and pedaling economy',
    purpose: 'Neuromuscular efficiency and pedaling economy',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Neuromuscular efficiency and pedaling economy' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Neuromuscular efficiency and pedaling economy' }
    ],
  },

  // W005 – Classic Tempo Blocks
  {
    id: 'w005',
    title: 'Classic Tempo Blocks',
    category: 'TEMPO',
    description: 'Muscular endurance, sustained power',
    purpose: 'Muscular endurance, sustained power',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Muscular endurance, sustained power' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Muscular endurance, sustained power' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Muscular endurance, sustained power' }
    ],
  },

  // W006 – Extended Tempo
  {
    id: 'w006',
    title: 'Extended Tempo',
    category: 'TEMPO',
    description: 'Time-in-zone for muscular endurance',
    purpose: 'Time-in-zone for muscular endurance',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Time-in-zone for muscular endurance' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Time-in-zone for muscular endurance' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Time-in-zone for muscular endurance' }
    ],
  },

  // W007 – Tempo with Surges
  {
    id: 'w007',
    title: 'Tempo with Surges',
    category: 'TEMPO',
    description: 'Tempo endurance with anaerobic spikes',
    purpose: 'Tempo endurance with anaerobic spikes',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Tempo endurance with anaerobic spikes' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 900, coachNote: '85% FTP', purpose: 'Tempo endurance with anaerobic spikes' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Tempo endurance with anaerobic spikes' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Tempo endurance with anaerobic spikes' }
    ],
  },

  // W008 – Progressive Tempo
  {
    id: 'w008',
    title: 'Progressive Tempo',
    category: 'TEMPO',
    description: 'Pacing discipline, progressive overload',
    purpose: 'Pacing discipline, progressive overload',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Pacing discipline, progressive overload' },
      { name: '78% effort', zone: 'Z3', powerLow: 73, powerHigh: 83, durationSecs: 600, coachNote: '78% FTP', purpose: 'Pacing discipline, progressive overload' },
      { name: '82% effort', zone: 'Z3', powerLow: 77, powerHigh: 87, durationSecs: 600, coachNote: '82% FTP', purpose: 'Pacing discipline, progressive overload' },
      { name: '86% effort', zone: 'Z3', powerLow: 81, powerHigh: 91, durationSecs: 600, coachNote: '86% FTP', purpose: 'Pacing discipline, progressive overload' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 600, coachNote: '90% FTP', purpose: 'Pacing discipline, progressive overload' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Pacing discipline, progressive overload' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Pacing discipline, progressive overload' }
    ],
  },

  // W009 – Sweet Spot Intervals
  {
    id: 'w009',
    title: 'Sweet Spot Intervals',
    category: 'THRESHOLD',
    description: 'Maximize threshold adaptation with manageable fatigue',
    purpose: 'Maximize threshold adaptation with manageable fatigue',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximize threshold adaptation with manageable fatigue' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximize threshold adaptation with manageable fatigue' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximize threshold adaptation with manageable fatigue' }
    ],
  },

  // W010 – Extended Sweet Spot
  {
    id: 'w010',
    title: 'Extended Sweet Spot',
    category: 'THRESHOLD',
    description: 'Long duration sweet spot for advanced riders',
    purpose: 'Long duration sweet spot for advanced riders',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Long duration sweet spot for advanced riders' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Long duration sweet spot for advanced riders' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Long duration sweet spot for advanced riders' }
    ],
  },

  // W011 – Sweet Spot Progression
  {
    id: 'w011',
    title: 'Sweet Spot Progression',
    category: 'THRESHOLD',
    description: 'Progressive overload within sweet spot',
    purpose: 'Progressive overload within sweet spot',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Progressive overload within sweet spot' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 720, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Progressive overload within sweet spot' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 720, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Progressive overload within sweet spot' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 720, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Progressive overload within sweet spot' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 540, coachNote: '95% FTP', purpose: 'Progressive overload within sweet spot' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Progressive overload within sweet spot' }
    ],
  },

  // W012 – Sweet Spot Over-Unders (Intro)
  {
    id: 'w012',
    title: 'Sweet Spot Over-Unders (Intro)',
    category: 'THRESHOLD',
    description: 'Introduce lactate clearing above/below threshold',
    purpose: 'Introduce lactate clearing above/below threshold',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Introduce lactate clearing above/below threshold' },
      { name: '92% effort', zone: 'Z4', powerLow: 87, powerHigh: 97, durationSecs: 120, coachNote: '92% FTP', purpose: 'Introduce lactate clearing above/below threshold' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 120, coachNote: '85% FTP', purpose: 'Introduce lactate clearing above/below threshold' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 360, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Introduce lactate clearing above/below threshold' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Introduce lactate clearing above/below threshold' }
    ],
  },

  // W013 – Classic 2 × 20
  {
    id: 'w013',
    title: 'Classic 2 × 20',
    category: 'BASE',
    description: 'Gold-standard FTP development',
    purpose: 'Gold-standard FTP development',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Gold-standard FTP development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Gold-standard FTP development' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Gold-standard FTP development' }
    ],
  },

  // W014 – Threshold Steps
  {
    id: 'w014',
    title: 'Threshold Steps',
    category: 'BASE',
    description: 'Progressive threshold exposure',
    purpose: 'Progressive threshold exposure',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Progressive threshold exposure' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Progressive threshold exposure' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Progressive threshold exposure' }
    ],
  },

  // W015 – Over-Under Intervals
  {
    id: 'w015',
    title: 'Over-Under Intervals',
    category: 'BASE',
    description: 'Lactate tolerance and clearance at threshold',
    purpose: 'Lactate tolerance and clearance at threshold',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Lactate tolerance and clearance at threshold' },
      { name: '105% effort', zone: 'Z5', powerLow: 100, powerHigh: 110, durationSecs: 120, coachNote: '105% FTP', purpose: 'Lactate tolerance and clearance at threshold' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 120, coachNote: '90% FTP', purpose: 'Lactate tolerance and clearance at threshold' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 480, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Lactate tolerance and clearance at threshold' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Lactate tolerance and clearance at threshold' }
    ],
  },

  // W016 – FTP Long Block
  {
    id: 'w016',
    title: 'FTP Long Block',
    category: 'THRESHOLD',
    description: 'Sustained threshold ability',
    purpose: 'Sustained threshold ability',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Sustained threshold ability' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sustained threshold ability' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sustained threshold ability' }
    ],
  },

  // W017 – Criss-Cross Intervals
  {
    id: 'w017',
    title: 'Criss-Cross Intervals',
    category: 'BASE',
    description: 'Threshold power with repeated micro-surges',
    purpose: 'Threshold power with repeated micro-surges',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Threshold power with repeated micro-surges' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 420, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Threshold power with repeated micro-surges' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Threshold power with repeated micro-surges' }
    ],
  },

  // W018 – Threshold Ramp
  {
    id: 'w018',
    title: 'Threshold Ramp',
    category: 'BASE',
    description: 'Finding and holding peak sustainable power',
    purpose: 'Finding and holding peak sustainable power',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Finding and holding peak sustainable power' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 420, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Finding and holding peak sustainable power' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Finding and holding peak sustainable power' }
    ],
  },

  // W019 – Classic 5 × 5
  {
    id: 'w019',
    title: 'Classic 5 × 5',
    category: 'BASE',
    description: 'VO2max development',
    purpose: 'VO2max development',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'VO2max development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max development' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max development' }
    ],
  },

  // W020 – Billat 30/30s
  {
    id: 'w020',
    title: 'Billat 30/30s',
    category: 'BASE',
    description: 'VO2max with short, repeatable efforts',
    purpose: 'VO2max with short, repeatable efforts',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max with short, repeatable efforts' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max with short, repeatable efforts' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max with short, repeatable efforts' }
    ],
  },

  // W021 – 4 × 8 VO2max
  {
    id: 'w021',
    title: '4 × 8 VO2max',
    category: 'VO2MAX',
    description: 'Extended VO2max accumulation',
    purpose: 'Extended VO2max accumulation',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Extended VO2max accumulation' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Extended VO2max accumulation' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Extended VO2max accumulation' }
    ],
  },

  // W022 – VO2max Pyramids
  {
    id: 'w022',
    title: 'VO2max Pyramids',
    category: 'VO2MAX',
    description: 'Varied VO2max stimulus',
    purpose: 'Varied VO2max stimulus',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Varied VO2max stimulus' },
      { name: '115% effort', zone: 'Z5', powerLow: 110, powerHigh: 120, durationSecs: 120, coachNote: '115% FTP', purpose: 'Varied VO2max stimulus' },
      { name: '112% effort', zone: 'Z5', powerLow: 107, powerHigh: 117, durationSecs: 180, coachNote: '112% FTP', purpose: 'Varied VO2max stimulus' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Varied VO2max stimulus' }
    ],
  },

  // W023 – 40/20 Repeats
  {
    id: 'w023',
    title: '40/20 Repeats',
    category: 'BASE',
    description: 'VO2max with high-intensity short bursts',
    purpose: 'VO2max with high-intensity short bursts',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max with high-intensity short bursts' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max with high-intensity short bursts' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max with high-intensity short bursts' }
    ],
  },

  // W024 – VO2max Over-Unders
  {
    id: 'w024',
    title: 'VO2max Over-Unders',
    category: 'VO2MAX',
    description: 'VO2max with threshold base',
    purpose: 'VO2max with threshold base',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max with threshold base' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 120, coachNote: '95% FTP', purpose: 'VO2max with threshold base' },
      { name: '115% effort', zone: 'Z5', powerLow: 110, powerHigh: 120, durationSecs: 60, coachNote: '115% FTP', purpose: 'VO2max with threshold base' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max with threshold base' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max with threshold base' }
    ],
  },

  // W025 – Norwegian 4 × 4
  {
    id: 'w025',
    title: 'Norwegian 4 × 4',
    category: 'BASE',
    description: 'VO2max capacity (research-validated protocol)',
    purpose: 'VO2max capacity (research-validated protocol)',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max capacity (research-validated protocol)' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max capacity (research-validated protocol)' }
    ],
  },

  // W026 – Descending VO2max
  {
    id: 'w026',
    title: 'Descending VO2max',
    category: 'VO2MAX',
    description: 'Fatigue-resistant VO2max capacity',
    purpose: 'Fatigue-resistant VO2max capacity',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Fatigue-resistant VO2max capacity' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 360, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Fatigue-resistant VO2max capacity' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Fatigue-resistant VO2max capacity' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Fatigue-resistant VO2max capacity' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Fatigue-resistant VO2max capacity' },
      { name: '120% effort', zone: 'Z6', powerLow: 115, powerHigh: 125, durationSecs: 120, coachNote: '120% FTP', purpose: 'Fatigue-resistant VO2max capacity' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Fatigue-resistant VO2max capacity' }
    ],
  },

  // W027 – Tabata Protocol
  {
    id: 'w027',
    title: 'Tabata Protocol',
    category: 'BASE',
    description: 'Anaerobic capacity, VO2max ceiling',
    purpose: 'Anaerobic capacity, VO2max ceiling',
    zone: 'Z1-Z2',
    duration: 50,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Anaerobic capacity, VO2max ceiling' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Anaerobic capacity, VO2max ceiling' }
    ],
  },

  // W028 – Anaerobic Repeats
  {
    id: 'w028',
    title: 'Anaerobic Repeats',
    category: 'ANAEROBIC',
    description: 'Build anaerobic work capacity',
    purpose: 'Build anaerobic work capacity',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Build anaerobic work capacity' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 60, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Build anaerobic work capacity' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 480, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Build anaerobic work capacity' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Build anaerobic work capacity' }
    ],
  },

  // W029 – 2-Minute Power
  {
    id: 'w029',
    title: '2-Minute Power',
    category: 'SPRINT',
    description: 'Anaerobic capacity, race breakaway power',
    purpose: 'Anaerobic capacity, race breakaway power',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Anaerobic capacity, race breakaway power' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Anaerobic capacity, race breakaway power' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 900, coachNote: '65% FTP', purpose: 'Anaerobic capacity, race breakaway power' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Anaerobic capacity, race breakaway power' }
    ],
  },

  // W030 – Microbursts
  {
    id: 'w030',
    title: 'Microbursts',
    category: 'BASE',
    description: 'Anaerobic power with minimal rest, simulate racing',
    purpose: 'Anaerobic power with minimal rest, simulate racing',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Anaerobic power with minimal rest, simulate racing' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Anaerobic power with minimal rest, simulate racing' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Anaerobic power with minimal rest, simulate racing' }
    ],
  },

  // W031 – Anaerobic Ladders
  {
    id: 'w031',
    title: 'Anaerobic Ladders',
    category: 'ANAEROBIC',
    description: 'Wide-spectrum anaerobic development',
    purpose: 'Wide-spectrum anaerobic development',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 60, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 120, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 120, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Wide-spectrum anaerobic development' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Wide-spectrum anaerobic development' }
    ],
  },

  // W032 – 3-Minute Anaerobic Blocks
  {
    id: 'w032',
    title: '3-Minute Anaerobic Blocks',
    category: 'ANAEROBIC',
    description: 'Extend anaerobic tolerance, bridge to VO2max',
    purpose: 'Extend anaerobic tolerance, bridge to VO2max',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Extend anaerobic tolerance, bridge to VO2max' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Extend anaerobic tolerance, bridge to VO2max' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Extend anaerobic tolerance, bridge to VO2max' }
    ],
  },

  // W033 – Sprint Repeats
  {
    id: 'w033',
    title: 'Sprint Repeats',
    category: 'SPRINT',
    description: 'Peak neuromuscular power, sprint form',
    purpose: 'Peak neuromuscular power, sprint form',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Peak neuromuscular power, sprint form' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Peak neuromuscular power, sprint form' }
    ],
  },

  // W034 – Standing Start Sprints
  {
    id: 'w034',
    title: 'Standing Start Sprints',
    category: 'SPRINT',
    description: 'Sprint power from low speed',
    purpose: 'Sprint power from low speed',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Sprint power from low speed' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sprint power from low speed' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sprint power from low speed' }
    ],
  },

  // W035 – Sprint-Endurance Combo
  {
    id: 'w035',
    title: 'Sprint-Endurance Combo',
    category: 'BASE',
    description: 'Sprint power layered on fatigued legs',
    purpose: 'Sprint power layered on fatigued legs',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Sprint power layered on fatigued legs' },
      { name: '72% effort', zone: 'Z2', powerLow: 67, powerHigh: 77, durationSecs: 2400, coachNote: '72% FTP', purpose: 'Sprint power layered on fatigued legs' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 900, coachNote: '65% FTP', purpose: 'Sprint power layered on fatigued legs' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sprint power layered on fatigued legs' }
    ],
  },

  // W036 – Explosive Repeats
  {
    id: 'w036',
    title: 'Explosive Repeats',
    category: 'BASE',
    description: 'Maximal acceleration, fast-twitch recruitment',
    purpose: 'Maximal acceleration, fast-twitch recruitment',
    zone: 'Z1-Z2',
    duration: 50,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Maximal acceleration, fast-twitch recruitment' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximal acceleration, fast-twitch recruitment' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximal acceleration, fast-twitch recruitment' }
    ],
  },

  // W037 – Crit Simulation
  {
    id: 'w037',
    title: 'Crit Simulation',
    category: 'BASE',
    description: 'Simulate criterium race demands',
    purpose: 'Simulate criterium race demands',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Simulate criterium race demands' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 600, coachNote: '65% FTP', purpose: 'Simulate criterium race demands' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Simulate criterium race demands' }
    ],
  },

  // W038 – Race Breakaway Simulation
  {
    id: 'w038',
    title: 'Race Breakaway Simulation',
    category: 'BASE',
    description: 'Sustain above-threshold after a hard effort',
    purpose: 'Sustain above-threshold after a hard effort',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Sustain above-threshold after a hard effort' },
      { name: '140% effort', zone: 'Z6', powerLow: 135, powerHigh: 145, durationSecs: 120, coachNote: '140% FTP', purpose: 'Sustain above-threshold after a hard effort' },
      { name: '105% effort', zone: 'Z5', powerLow: 100, powerHigh: 110, durationSecs: 300, coachNote: '105% FTP', purpose: 'Sustain above-threshold after a hard effort' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 900, coachNote: '95% FTP', purpose: 'Sustain above-threshold after a hard effort' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sustain above-threshold after a hard effort' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sustain above-threshold after a hard effort' }
    ],
  },

  // W039 – Group Ride Simulation
  {
    id: 'w039',
    title: 'Group Ride Simulation',
    category: 'BASE',
    description: 'Manage variable power surges',
    purpose: 'Manage variable power surges',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Manage variable power surges' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 600, coachNote: '65% FTP', purpose: 'Manage variable power surges' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Manage variable power surges' }
    ],
  },

  // W040 – Climbing Repeats
  {
    id: 'w040',
    title: 'Climbing Repeats',
    category: 'BASE',
    description: 'Climbing power and pacing',
    purpose: 'Climbing power and pacing',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Climbing power and pacing' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Climbing power and pacing' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Climbing power and pacing' }
    ],
  },

  // W041 – Time Trial Simulation
  {
    id: 'w041',
    title: 'Time Trial Simulation',
    category: 'BASE',
    description: 'Pacing for a 40 km TT',
    purpose: 'Pacing for a 40 km TT',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Pacing for a 40 km TT' },
      { name: 'Rep 1', zone: 'Z4', powerLow: 92, powerHigh: 95, durationSecs: 0, coachNote: '95% FTP effort', purpose: 'Pacing for a 40 km TT' },
      { name: 'Rep 2', zone: 'Z4', powerLow: 92, powerHigh: 95, durationSecs: 0, coachNote: '95% FTP effort', purpose: 'Pacing for a 40 km TT' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Pacing for a 40 km TT' }
    ],
  },

  // W042 – Kitchen Sink
  {
    id: 'w042',
    title: 'Kitchen Sink',
    category: 'BASE',
    description: 'Multi-system workout hitting all zones',
    purpose: 'Multi-system workout hitting all zones',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Multi-system workout hitting all zones' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-system workout hitting all zones' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-system workout hitting all zones' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 60, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-system workout hitting all zones' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 120, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-system workout hitting all zones' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Multi-system workout hitting all zones' }
    ],
  },

  // W043 – Gravel Simulation
  {
    id: 'w043',
    title: 'Gravel Simulation',
    category: 'BASE',
    description: 'Variable terrain, sustained effort with power spikes',
    purpose: 'Variable terrain, sustained effort with power spikes',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Variable terrain, sustained effort with power spikes' },
      { name: '75% effort', zone: 'Z3', powerLow: 70, powerHigh: 80, durationSecs: 480, coachNote: '75% FTP', purpose: 'Variable terrain, sustained effort with power spikes' },
      { name: '110% effort', zone: 'Z5', powerLow: 105, powerHigh: 115, durationSecs: 180, coachNote: '110% FTP', purpose: 'Variable terrain, sustained effort with power spikes' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 300, coachNote: '68% FTP', purpose: 'Variable terrain, sustained effort with power spikes' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 240, coachNote: '95% FTP', purpose: 'Variable terrain, sustained effort with power spikes' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Variable terrain, sustained effort with power spikes' }
    ],
  },

  // W044 – Active Recovery
  {
    id: 'w044',
    title: 'Active Recovery',
    category: 'RECOVERY',
    description: 'Blood flow, recovery, loosen legs',
    purpose: 'Blood flow, recovery, loosen legs',
    zone: 'Z2',
    duration: 45,
    difficultyScore: 1,
    intervals: () => [
      { name: 'Main', zone: 'Z2', powerLow: 65, powerHigh: 75, durationSecs: 1500, coachNote: 'Blood flow, recovery, loosen legs', purpose: 'Blood flow, recovery, loosen legs' }
    ],
  },

  // W045 – Recovery with Openers
  {
    id: 'w045',
    title: 'Recovery with Openers',
    category: 'RECOVERY',
    description: 'Easy ride with leg-opening accelerations',
    purpose: 'Easy ride with leg-opening accelerations',
    zone: 'Z1',
    duration: 50,
    difficultyScore: 1,
    intervals: () => [
      { name: '50% effort', zone: 'Z1', powerLow: 45, powerHigh: 55, durationSecs: 900, coachNote: '50% FTP', purpose: 'Easy ride with leg-opening accelerations' },
      { name: 'Rep 1', zone: 'Z6', powerLow: 55, powerHigh: 120, durationSecs: 300, coachNote: '120% FTP effort', purpose: 'Easy ride with leg-opening accelerations' },
      { name: '55% effort', zone: 'Z2', powerLow: 50, powerHigh: 60, durationSecs: 600, coachNote: '55% FTP', purpose: 'Easy ride with leg-opening accelerations' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Easy ride with leg-opening accelerations' }
    ],
  },

  // W046 – Pre-Race Activation
  {
    id: 'w046',
    title: 'Pre-Race Activation',
    category: 'BASE',
    description: 'Prime legs and nervous system before competition',
    purpose: 'Prime legs and nervous system before competition',
    zone: 'Z2',
    duration: 35,
    difficultyScore: 1,
    intervals: () => [
      { name: '55% effort', zone: 'Z2', powerLow: 50, powerHigh: 60, durationSecs: 600, coachNote: '55% FTP', purpose: 'Prime legs and nervous system before competition' },
      { name: '70% effort', zone: 'Z2', powerLow: 65, powerHigh: 75, durationSecs: 300, coachNote: '70% FTP', purpose: 'Prime legs and nervous system before competition' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 60, coachNote: '90% FTP', purpose: 'Prime legs and nervous system before competition' },
      { name: '100% effort', zone: 'Z4', powerLow: 95, powerHigh: 105, durationSecs: 60, coachNote: '100% FTP', purpose: 'Prime legs and nervous system before competition' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Prime legs and nervous system before competition' }
    ],
  },

  // W047 – Polarized Z2 + VO2max
  {
    id: 'w047',
    title: 'Polarized Z2 + VO2max',
    category: 'VO2MAX',
    description: 'Polarized model — low and high, nothing in between',
    purpose: 'Polarized model — low and high, nothing in between',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Polarized model — low and high, nothing in between' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 1200, coachNote: '68% FTP', purpose: 'Polarized model — low and high, nothing in between' },
      { name: 'Rep 1', zone: 'Z1', powerLow: 115, powerHigh: 50, durationSecs: 240, coachNote: '50% FTP effort', purpose: 'Polarized model — low and high, nothing in between' },
      { name: 'Rep 2', zone: 'Z1', powerLow: 115, powerHigh: 50, durationSecs: 240, coachNote: '50% FTP effort', purpose: 'Polarized model — low and high, nothing in between' },
      { name: 'Rep 3', zone: 'Z1', powerLow: 115, powerHigh: 50, durationSecs: 240, coachNote: '50% FTP effort', purpose: 'Polarized model — low and high, nothing in between' },
      { name: 'Rep 4', zone: 'Z1', powerLow: 115, powerHigh: 50, durationSecs: 240, coachNote: '50% FTP effort', purpose: 'Polarized model — low and high, nothing in between' },
      { name: 'Rep 5', zone: 'Z1', powerLow: 115, powerHigh: 50, durationSecs: 240, coachNote: '50% FTP effort', purpose: 'Polarized model — low and high, nothing in between' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 1200, coachNote: '68% FTP', purpose: 'Polarized model — low and high, nothing in between' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Polarized model — low and high, nothing in between' }
    ],
  },

  // W048 – Polarized Sprint Day
  {
    id: 'w048',
    title: 'Polarized Sprint Day',
    category: 'SPRINT',
    description: 'Polarized low-intensity base with neuromuscular bursts',
    purpose: 'Polarized low-intensity base with neuromuscular bursts',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Polarized low-intensity base with neuromuscular bursts' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Polarized low-intensity base with neuromuscular bursts' }
    ],
  },

  // W049 – Seiler 4 × 8
  {
    id: 'w049',
    title: 'Seiler 4 × 8',
    category: 'BASE',
    description: 'VO2max accumulation in a polarized framework',
    purpose: 'VO2max accumulation in a polarized framework',
    zone: 'Z1-Z2',
    duration: 85,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'VO2max accumulation in a polarized framework' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max accumulation in a polarized framework' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 1200, coachNote: '65% FTP', purpose: 'VO2max accumulation in a polarized framework' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max accumulation in a polarized framework' }
    ],
  },

  // W050 – Big Gear Force Reps
  {
    id: 'w050',
    title: 'Big Gear Force Reps',
    category: 'BASE',
    description: 'Muscular force production, pedal strength',
    purpose: 'Muscular force production, pedal strength',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Muscular force production, pedal strength' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 180, coachNote: '85% FTP', purpose: 'Muscular force production, pedal strength' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Muscular force production, pedal strength' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 900, coachNote: '65% FTP', purpose: 'Muscular force production, pedal strength' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Muscular force production, pedal strength' }
    ],
  },

  // W051 – Single-Leg Drills
  {
    id: 'w051',
    title: 'Single-Leg Drills',
    category: 'BASE',
    description: 'Pedaling efficiency, eliminate dead spots',
    purpose: 'Pedaling efficiency, eliminate dead spots',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 1,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Pedaling efficiency, eliminate dead spots' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 120, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Pedaling efficiency, eliminate dead spots' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 600, coachNote: '65% FTP', purpose: 'Pedaling efficiency, eliminate dead spots' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Pedaling efficiency, eliminate dead spots' }
    ],
  },

  // W052 – Torque Intervals
  {
    id: 'w052',
    title: 'Torque Intervals',
    category: 'BASE',
    description: 'Max force per pedal stroke, climbing strength',
    purpose: 'Max force per pedal stroke, climbing strength',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Max force per pedal stroke, climbing strength' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Max force per pedal stroke, climbing strength' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Max force per pedal stroke, climbing strength' }
    ],
  },

  // W053 – Ronnestad Intervals
  {
    id: 'w053',
    title: 'Ronnestad Intervals',
    category: 'BASE',
    description: 'VO2max with declining rest (research protocol)',
    purpose: 'VO2max with declining rest (research protocol)',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max with declining rest (research protocol)' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max with declining rest (research protocol)' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 600, coachNote: '65% FTP', purpose: 'VO2max with declining rest (research protocol)' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max with declining rest (research protocol)' }
    ],
  },

  // W054 – Gimenez Intervals
  {
    id: 'w054',
    title: 'Gimenez Intervals',
    category: 'BASE',
    description: 'VO2max using sustained sub-max and supra-max alternation',
    purpose: 'VO2max using sustained sub-max and supra-max alternation',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max using sustained sub-max and supra-max alternation' },
      { name: '108% effort', zone: 'Z5', powerLow: 103, powerHigh: 113, durationSecs: 60, coachNote: '108% FTP', purpose: 'VO2max using sustained sub-max and supra-max alternation' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max using sustained sub-max and supra-max alternation' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max using sustained sub-max and supra-max alternation' }
    ],
  },

  // W055 – Miracle Intervals
  {
    id: 'w055',
    title: 'Miracle Intervals',
    category: 'BASE',
    description: 'Motor unit activation, anaerobic/sprint power',
    purpose: 'Motor unit activation, anaerobic/sprint power',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Motor unit activation, anaerobic/sprint power' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Motor unit activation, anaerobic/sprint power' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Motor unit activation, anaerobic/sprint power' }
    ],
  },

  // W056 – Ramp Test (FTP Assessment)
  {
    id: 'w056',
    title: 'Ramp Test (FTP Assessment)',
    category: 'THRESHOLD',
    description: 'FTP estimation',
    purpose: 'FTP estimation',
    zone: 'Z1-Z2',
    duration: 35,
    difficultyScore: 1,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 300, coachNote: 'Easy spin, build gradually', purpose: 'FTP estimation' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'FTP estimation' }
    ],
  },

  // W057 – 20-Minute FTP Test
  {
    id: 'w057',
    title: '20-Minute FTP Test',
    category: 'THRESHOLD',
    description: 'FTP measurement',
    purpose: 'FTP measurement',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'FTP measurement' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'FTP measurement' }
    ],
  },

  // W058 – Kolie Moore FTP Test
  {
    id: 'w058',
    title: 'Kolie Moore FTP Test',
    category: 'THRESHOLD',
    description: 'Longer, steadier FTP assessment',
    purpose: 'Longer, steadier FTP assessment',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Longer, steadier FTP assessment' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Longer, steadier FTP assessment' }
    ],
  },

  // W059 – Rønnestad 30/15s
  {
    id: 'w059',
    title: 'Rønnestad 30/15s',
    category: 'BASE',
    description: 'Superior VO2max stimulus via short intervals',
    purpose: 'Superior VO2max stimulus via short intervals',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Superior VO2max stimulus via short intervals' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Superior VO2max stimulus via short intervals' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Superior VO2max stimulus via short intervals' }
    ],
  },

  // W060 – Rønnestad Fast-Start 5 × 5
  {
    id: 'w060',
    title: 'Rønnestad Fast-Start 5 × 5',
    category: 'BASE',
    description: 'Accelerated VO2max response via hard-start pacing',
    purpose: 'Accelerated VO2max response via hard-start pacing',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Accelerated VO2max response via hard-start pacing' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Accelerated VO2max response via hard-start pacing' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Accelerated VO2max response via hard-start pacing' }
    ],
  },

  // W061 – Bossi Oscillating Intervals
  {
    id: 'w061',
    title: 'Bossi Oscillating Intervals',
    category: 'BASE',
    description: 'VO2max via variable-intensity within each interval',
    purpose: 'VO2max via variable-intensity within each interval',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Rep 1', zone: 'Z4', powerLow: 77, powerHigh: 95, durationSecs: 300, coachNote: '95% FTP effort', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Rep 2', zone: 'Z4', powerLow: 77, powerHigh: 95, durationSecs: 300, coachNote: '95% FTP effort', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Rep 3', zone: 'Z4', powerLow: 77, powerHigh: 95, durationSecs: 300, coachNote: '95% FTP effort', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Rep 4', zone: 'Z4', powerLow: 77, powerHigh: 95, durationSecs: 300, coachNote: '95% FTP effort', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Rep 5', zone: 'Z4', powerLow: 77, powerHigh: 95, durationSecs: 300, coachNote: '95% FTP effort', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Rep 6', zone: 'Z4', powerLow: 77, powerHigh: 95, durationSecs: 300, coachNote: '95% FTP effort', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max via variable-intensity within each interval' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max via variable-intensity within each interval' }
    ],
  },

  // W062 – Billat 30/30s (Extended)
  {
    id: 'w062',
    title: 'Billat 30/30s (Extended)',
    category: 'BASE',
    description: 'Maximal VO2max accumulation, research-optimized dose',
    purpose: 'Maximal VO2max accumulation, research-optimized dose',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximal VO2max accumulation, research-optimized dose' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximal VO2max accumulation, research-optimized dose' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximal VO2max accumulation, research-optimized dose' }
    ],
  },

  // W063 – Seiler 4 × 4 vs 4 × 8 Hybrid
  {
    id: 'w063',
    title: 'Seiler 4 × 4 vs 4 × 8 Hybrid',
    category: 'BASE',
    description: 'Best of both Seiler protocols in one session',
    purpose: 'Best of both Seiler protocols in one session',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Best of both Seiler protocols in one session' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 480, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Best of both Seiler protocols in one session' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Best of both Seiler protocols in one session' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Best of both Seiler protocols in one session' }
    ],
  },

  // W064 – Hard-Start Decreasing VO2max
  {
    id: 'w064',
    title: 'Hard-Start Decreasing VO2max',
    category: 'VO2MAX',
    description: 'Maximize time near VO2max with fatigue-managed pacing',
    purpose: 'Maximize time near VO2max with fatigue-managed pacing',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximize time near VO2max with fatigue-managed pacing' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximize time near VO2max with fatigue-managed pacing' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximize time near VO2max with fatigue-managed pacing' }
    ],
  },

  // W065 – 40/20 VO2max (MTB Style)
  {
    id: 'w065',
    title: '40/20 VO2max (MTB Style)',
    category: 'VO2MAX',
    description: 'VO2max + anaerobic power, MTB race simulation',
    purpose: 'VO2max + anaerobic power, MTB race simulation',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'VO2max + anaerobic power, MTB race simulation' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'VO2max + anaerobic power, MTB race simulation' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'VO2max + anaerobic power, MTB race simulation' }
    ],
  },

  // W066 – Diabolical Criss-Cross
  {
    id: 'w066',
    title: 'Diabolical Criss-Cross',
    category: 'BASE',
    description: 'Extreme lactate tolerance, criterium/gravel racing',
    purpose: 'Extreme lactate tolerance, criterium/gravel racing',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Extreme lactate tolerance, criterium/gravel racing' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 480, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Extreme lactate tolerance, criterium/gravel racing' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Extreme lactate tolerance, criterium/gravel racing' }
    ],
  },

  // W067 – Tempo Over-Unders with Anaerobic Spikes
  {
    id: 'w067',
    title: 'Tempo Over-Unders with Anaerobic Spikes',
    category: 'TEMPO',
    description: 'Tempo endurance with Z6 attacks',
    purpose: 'Tempo endurance with Z6 attacks',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Tempo endurance with Z6 attacks' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 240, coachNote: '85% FTP', purpose: 'Tempo endurance with Z6 attacks' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 240, coachNote: '85% FTP', purpose: 'Tempo endurance with Z6 attacks' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 180, coachNote: '85% FTP', purpose: 'Tempo endurance with Z6 attacks' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 360, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Tempo endurance with Z6 attacks' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Tempo endurance with Z6 attacks' }
    ],
  },

  // W068 – Sweet Spot with VO2max Kicks
  {
    id: 'w068',
    title: 'Sweet Spot with VO2max Kicks',
    category: 'THRESHOLD',
    description: 'Sweet spot endurance + VO2max spikes',
    purpose: 'Sweet spot endurance + VO2max spikes',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Sweet spot endurance + VO2max spikes' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 900, coachNote: '90% FTP', purpose: 'Sweet spot endurance + VO2max spikes' },
      { name: '115% effort', zone: 'Z5', powerLow: 110, powerHigh: 120, durationSecs: 60, coachNote: '115% FTP', purpose: 'Sweet spot endurance + VO2max spikes' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sweet spot endurance + VO2max spikes' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sweet spot endurance + VO2max spikes' }
    ],
  },

  // W069 – Ritter-Style Mixed Over-Unders
  {
    id: 'w069',
    title: 'Ritter-Style Mixed Over-Unders',
    category: 'BASE',
    description: 'Threshold with variable over/under durations',
    purpose: 'Threshold with variable over/under durations',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Threshold with variable over/under durations' },
      { name: '92% effort', zone: 'Z4', powerLow: 87, powerHigh: 97, durationSecs: 180, coachNote: '92% FTP', purpose: 'Threshold with variable over/under durations' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 120, coachNote: '90% FTP', purpose: 'Threshold with variable over/under durations' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Threshold with variable over/under durations' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Threshold with variable over/under durations' }
    ],
  },

  // W070 – Progressive Over-Unders
  {
    id: 'w070',
    title: 'Progressive Over-Unders',
    category: 'BASE',
    description: 'Build threshold tolerance with escalating difficulty',
    purpose: 'Build threshold tolerance with escalating difficulty',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Build threshold tolerance with escalating difficulty' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Build threshold tolerance with escalating difficulty' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Build threshold tolerance with escalating difficulty' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Build threshold tolerance with escalating difficulty' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Build threshold tolerance with escalating difficulty' }
    ],
  },

  // W071 – The 30-Minute VO2max Blitz
  {
    id: 'w071',
    title: 'The 30-Minute VO2max Blitz',
    category: 'VO2MAX',
    description: 'Maximum training stimulus in minimal time',
    purpose: 'Maximum training stimulus in minimal time',
    zone: 'Z1-Z2',
    duration: 30,
    difficultyScore: 1,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 300, coachNote: 'Easy spin, build gradually', purpose: 'Maximum training stimulus in minimal time' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 60, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximum training stimulus in minimal time' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 300, coachNote: '65% FTP', purpose: 'Maximum training stimulus in minimal time' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy recovery spinning', purpose: 'Maximum training stimulus in minimal time' }
    ],
  },

  // W072 – 30-Minute Over-Under Express
  {
    id: 'w072',
    title: '30-Minute Over-Under Express',
    category: 'BASE',
    description: 'Threshold stimulus in 30 minutes',
    purpose: 'Threshold stimulus in 30 minutes',
    zone: 'Z1-Z2',
    duration: 30,
    difficultyScore: 1,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 300, coachNote: 'Easy spin, build gradually', purpose: 'Threshold stimulus in 30 minutes' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 120, coachNote: '95% FTP', purpose: 'Threshold stimulus in 30 minutes' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Threshold stimulus in 30 minutes' }
    ],
  },

  // W073 – 30-Minute Speed Intervals
  {
    id: 'w073',
    title: '30-Minute Speed Intervals',
    category: 'BASE',
    description: 'Neuromuscular and anaerobic in 30 minutes',
    purpose: 'Neuromuscular and anaerobic in 30 minutes',
    zone: 'Z1-Z2',
    duration: 30,
    difficultyScore: 1,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 300, coachNote: 'Easy spin, build gradually', purpose: 'Neuromuscular and anaerobic in 30 minutes' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Neuromuscular and anaerobic in 30 minutes' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy recovery spinning', purpose: 'Neuromuscular and anaerobic in 30 minutes' }
    ],
  },

  // W074 – 45-Minute Sweet Spot Express
  {
    id: 'w074',
    title: '45-Minute Sweet Spot Express',
    category: 'THRESHOLD',
    description: 'Sweet spot development in 45 minutes',
    purpose: 'Sweet spot development in 45 minutes',
    zone: 'Z1-Z2',
    duration: 45,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 480, coachNote: 'Easy spin, build gradually', purpose: 'Sweet spot development in 45 minutes' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 720, coachNote: '90% FTP', purpose: 'Sweet spot development in 45 minutes' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sweet spot development in 45 minutes' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Sweet spot development in 45 minutes' }
    ],
  },

  // W075 – 45-Minute Tabata + Threshold Combo
  {
    id: 'w075',
    title: '45-Minute Tabata + Threshold Combo',
    category: 'BASE',
    description: 'Anaerobic + threshold in short duration',
    purpose: 'Anaerobic + threshold in short duration',
    zone: 'Z1-Z2',
    duration: 45,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 480, coachNote: 'Easy spin, build gradually', purpose: 'Anaerobic + threshold in short duration' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 600, coachNote: '95% FTP', purpose: 'Anaerobic + threshold in short duration' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Anaerobic + threshold in short duration' }
    ],
  },

  // W076 – 45-Minute Descending Pyramid
  {
    id: 'w076',
    title: '45-Minute Descending Pyramid',
    category: 'BASE',
    description: 'Multi-zone stimulus in compact format',
    purpose: 'Multi-zone stimulus in compact format',
    zone: 'Z1-Z2',
    duration: 45,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 480, coachNote: 'Easy spin, build gradually', purpose: 'Multi-zone stimulus in compact format' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-zone stimulus in compact format' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-zone stimulus in compact format' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-zone stimulus in compact format' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 120, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Multi-zone stimulus in compact format' },
      { name: '135% effort', zone: 'Z6', powerLow: 130, powerHigh: 140, durationSecs: 60, coachNote: '135% FTP', purpose: 'Multi-zone stimulus in compact format' },
      { name: '60% effort', zone: 'Z2', powerLow: 55, powerHigh: 65, durationSecs: 300, coachNote: '60% FTP', purpose: 'Multi-zone stimulus in compact format' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Multi-zone stimulus in compact format' }
    ],
  },

  // W077 – Gran Fondo Pacing
  {
    id: 'w077',
    title: 'Gran Fondo Pacing',
    category: 'BASE',
    description: 'Long-event pacing discipline',
    purpose: 'Long-event pacing discipline',
    zone: 'Z1-Z2',
    duration: 120,
    difficultyScore: 9,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Long-event pacing discipline' },
      { name: '70% effort', zone: 'Z2', powerLow: 65, powerHigh: 75, durationSecs: 1800, coachNote: '70% FTP', purpose: 'Long-event pacing discipline' },
      { name: '88% effort', zone: 'Z3', powerLow: 83, powerHigh: 93, durationSecs: 600, coachNote: '88% FTP', purpose: 'Long-event pacing discipline' },
      { name: '72% effort', zone: 'Z2', powerLow: 67, powerHigh: 77, durationSecs: 1200, coachNote: '72% FTP', purpose: 'Long-event pacing discipline' },
      { name: '92% effort', zone: 'Z4', powerLow: 87, powerHigh: 97, durationSecs: 900, coachNote: '92% FTP', purpose: 'Long-event pacing discipline' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 900, coachNote: '65% FTP', purpose: 'Long-event pacing discipline' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 600, coachNote: '95% FTP', purpose: 'Long-event pacing discipline' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Long-event pacing discipline' }
    ],
  },

  // W078 – Cyclocross Race Simulation
  {
    id: 'w078',
    title: 'Cyclocross Race Simulation',
    category: 'BASE',
    description: 'CX-specific power demands',
    purpose: 'CX-specific power demands',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'CX-specific power demands' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 180, coachNote: '95% FTP', purpose: 'CX-specific power demands' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 120, coachNote: '90% FTP', purpose: 'CX-specific power demands' },
      { name: '70% effort', zone: 'Z2', powerLow: 65, powerHigh: 75, durationSecs: 60, coachNote: '70% FTP', purpose: 'CX-specific power demands' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 180, coachNote: '95% FTP', purpose: 'CX-specific power demands' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 120, coachNote: '85% FTP', purpose: 'CX-specific power demands' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'CX-specific power demands' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'CX-specific power demands' }
    ],
  },

  // W079 – Road Race Finale Simulation
  {
    id: 'w079',
    title: 'Road Race Finale Simulation',
    category: 'BASE',
    description: 'Practice race-finishing power on fatigued legs',
    purpose: 'Practice race-finishing power on fatigued legs',
    zone: 'Z1-Z2',
    duration: 90,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: '72% effort', zone: 'Z2', powerLow: 67, powerHigh: 77, durationSecs: 2400, coachNote: '72% FTP', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 300, coachNote: '95% FTP', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: '110% effort', zone: 'Z5', powerLow: 105, powerHigh: 115, durationSecs: 180, coachNote: '110% FTP', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: '75% effort', zone: 'Z3', powerLow: 70, powerHigh: 80, durationSecs: 120, coachNote: '75% FTP', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: '130% effort', zone: 'Z6', powerLow: 125, powerHigh: 135, durationSecs: 60, coachNote: '130% FTP', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: '75% effort', zone: 'Z3', powerLow: 70, powerHigh: 80, durationSecs: 120, coachNote: '75% FTP', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: '100% effort', zone: 'Z4', powerLow: 95, powerHigh: 105, durationSecs: 300, coachNote: '100% FTP', purpose: 'Practice race-finishing power on fatigued legs' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Practice race-finishing power on fatigued legs' }
    ],
  },

  // W080 – MTB Cross-Country Simulation
  {
    id: 'w080',
    title: 'MTB Cross-Country Simulation',
    category: 'BASE',
    description: 'XC MTB race demands — punchy climbs, recoveries',
    purpose: 'XC MTB race demands — punchy climbs, recoveries',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'XC MTB race demands — punchy climbs, recoveries' },
      { name: '110% effort', zone: 'Z5', powerLow: 105, powerHigh: 115, durationSecs: 120, coachNote: '110% FTP', purpose: 'XC MTB race demands — punchy climbs, recoveries' },
      { name: '60% effort', zone: 'Z2', powerLow: 55, powerHigh: 65, durationSecs: 60, coachNote: '60% FTP', purpose: 'XC MTB race demands — punchy climbs, recoveries' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 180, coachNote: '95% FTP', purpose: 'XC MTB race demands — punchy climbs, recoveries' },
      { name: '60% effort', zone: 'Z2', powerLow: 55, powerHigh: 65, durationSecs: 60, coachNote: '60% FTP', purpose: 'XC MTB race demands — punchy climbs, recoveries' },
      { name: '75% effort', zone: 'Z3', powerLow: 70, powerHigh: 80, durationSecs: 120, coachNote: '75% FTP', purpose: 'XC MTB race demands — punchy climbs, recoveries' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'XC MTB race demands — punchy climbs, recoveries' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'XC MTB race demands — punchy climbs, recoveries' }
    ],
  },

  // W081 – Track Pursuit Preparation
  {
    id: 'w081',
    title: 'Track Pursuit Preparation',
    category: 'BASE',
    description: 'Sustained supra-threshold for individual pursuit',
    purpose: 'Sustained supra-threshold for individual pursuit',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Sustained supra-threshold for individual pursuit' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 180, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sustained supra-threshold for individual pursuit' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Sustained supra-threshold for individual pursuit' }
    ],
  },

  // W082 – Hill Climb TT Simulation
  {
    id: 'w082',
    title: 'Hill Climb TT Simulation',
    category: 'BASE',
    description: 'Sustained climbing at race intensity',
    purpose: 'Sustained climbing at race intensity',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Sustained climbing at race intensity' },
      { name: 'Rep 1', zone: 'Z4', powerLow: 95, powerHigh: 100, durationSecs: 300, coachNote: '100% FTP effort', purpose: 'Sustained climbing at race intensity' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sustained climbing at race intensity' },
      { name: '98% effort', zone: 'Z4', powerLow: 93, powerHigh: 103, durationSecs: 600, coachNote: '98% FTP', purpose: 'Sustained climbing at race intensity' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sustained climbing at race intensity' }
    ],
  },

  // W083 – Sweet Spot After Endurance
  {
    id: 'w083',
    title: 'Sweet Spot After Endurance',
    category: 'BASE',
    description: 'Quality work on pre-fatigued legs',
    purpose: 'Quality work on pre-fatigued legs',
    zone: 'Z1-Z2',
    duration: 120,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Quality work on pre-fatigued legs' },
      { name: '68% effort', zone: 'Z2', powerLow: 63, powerHigh: 73, durationSecs: 3600, coachNote: '68% FTP', purpose: 'Quality work on pre-fatigued legs' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 900, coachNote: '90% FTP', purpose: 'Quality work on pre-fatigued legs' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Quality work on pre-fatigued legs' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Quality work on pre-fatigued legs' }
    ],
  },

  // W084 – Threshold After Tempo
  {
    id: 'w084',
    title: 'Threshold After Tempo',
    category: 'TEMPO',
    description: 'FTP sustainability on tired legs',
    purpose: 'FTP sustainability on tired legs',
    zone: 'Z1-Z2',
    duration: 100,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'FTP sustainability on tired legs' },
      { name: '82% effort', zone: 'Z3', powerLow: 77, powerHigh: 87, durationSecs: 1800, coachNote: '82% FTP', purpose: 'FTP sustainability on tired legs' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'FTP sustainability on tired legs' },
      { name: '97% effort', zone: 'Z4', powerLow: 92, powerHigh: 102, durationSecs: 900, coachNote: '97% FTP', purpose: 'FTP sustainability on tired legs' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'FTP sustainability on tired legs' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'FTP sustainability on tired legs' }
    ],
  },

  // W085 – VO2max on Tired Legs
  {
    id: 'w085',
    title: 'VO2max on Tired Legs',
    category: 'VO2MAX',
    description: 'Simulate late-race attacks',
    purpose: 'Simulate late-race attacks',
    zone: 'Z1-Z2',
    duration: 100,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Simulate late-race attacks' },
      { name: '72% effort', zone: 'Z2', powerLow: 67, powerHigh: 77, durationSecs: 2400, coachNote: '72% FTP', purpose: 'Simulate late-race attacks' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 600, coachNote: '85% FTP', purpose: 'Simulate late-race attacks' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Simulate late-race attacks' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Simulate late-race attacks' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Simulate late-race attacks' }
    ],
  },

  // W086 – Endurance with Progressive Finale
  {
    id: 'w086',
    title: 'Endurance with Progressive Finale',
    category: 'BASE',
    description: 'Negative split pacing, marathon ride prep',
    purpose: 'Negative split pacing, marathon ride prep',
    zone: 'Z1-Z2',
    duration: 150,
    difficultyScore: 9,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Negative split pacing, marathon ride prep' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 3600, coachNote: '65% FTP', purpose: 'Negative split pacing, marathon ride prep' },
      { name: '72% effort', zone: 'Z2', powerLow: 67, powerHigh: 77, durationSecs: 1800, coachNote: '72% FTP', purpose: 'Negative split pacing, marathon ride prep' },
      { name: '82% effort', zone: 'Z3', powerLow: 77, powerHigh: 87, durationSecs: 1200, coachNote: '82% FTP', purpose: 'Negative split pacing, marathon ride prep' },
      { name: '92% effort', zone: 'Z4', powerLow: 87, powerHigh: 97, durationSecs: 600, coachNote: '92% FTP', purpose: 'Negative split pacing, marathon ride prep' },
      { name: '100% effort', zone: 'Z4', powerLow: 95, powerHigh: 105, durationSecs: 600, coachNote: '100% FTP', purpose: 'Negative split pacing, marathon ride prep' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Negative split pacing, marathon ride prep' }
    ],
  },

  // W087 – Spin-Ups
  {
    id: 'w087',
    title: 'Spin-Ups',
    category: 'BASE',
    description: 'Maximum cadence development, neuromuscular speed',
    purpose: 'Maximum cadence development, neuromuscular speed',
    zone: 'Z1-Z2',
    duration: 50,
    difficultyScore: 1,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximum cadence development, neuromuscular speed' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 600, coachNote: '65% FTP', purpose: 'Maximum cadence development, neuromuscular speed' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximum cadence development, neuromuscular speed' }
    ],
  },

  // W088 – Cadence Contrast Intervals
  {
    id: 'w088',
    title: 'Cadence Contrast Intervals',
    category: 'BASE',
    description: 'Muscle recruitment across cadence spectrum',
    purpose: 'Muscle recruitment across cadence spectrum',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Muscle recruitment across cadence spectrum' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 480, coachNote: '85% FTP', purpose: 'Muscle recruitment across cadence spectrum' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Muscle recruitment across cadence spectrum' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Muscle recruitment across cadence spectrum' }
    ],
  },

  // W089 – Isolated Leg Training (ILT) + Sweet Spot
  {
    id: 'w089',
    title: 'Isolated Leg Training (ILT) + Sweet Spot',
    category: 'THRESHOLD',
    description: 'Pedaling efficiency before sweet spot work',
    purpose: 'Pedaling efficiency before sweet spot work',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Pedaling efficiency before sweet spot work' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 300, coachNote: '65% FTP', purpose: 'Pedaling efficiency before sweet spot work' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 720, coachNote: '90% FTP', purpose: 'Pedaling efficiency before sweet spot work' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Pedaling efficiency before sweet spot work' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy recovery spinning', purpose: 'Pedaling efficiency before sweet spot work' }
    ],
  },

  // W090 – Block Day 1: Threshold Focus
  {
    id: 'w090',
    title: 'Block Day 1: Threshold Focus',
    category: 'BASE',
    description: 'First session of a 2–3 day training block',
    purpose: 'First session of a 2–3 day training block',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'First session of a 2–3 day training block' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 360, coachNote: 'Easy spinning, prepare for next effort', purpose: 'First session of a 2–3 day training block' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'First session of a 2–3 day training block' }
    ],
  },

  // W091 – Block Day 2: VO2max Focus
  {
    id: 'w091',
    title: 'Block Day 2: VO2max Focus',
    category: 'VO2MAX',
    description: 'Second session, build on Day 1 fatigue',
    purpose: 'Second session, build on Day 1 fatigue',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Second session, build on Day 1 fatigue' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Second session, build on Day 1 fatigue' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 600, coachNote: '65% FTP', purpose: 'Second session, build on Day 1 fatigue' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Second session, build on Day 1 fatigue' }
    ],
  },

  // W092 – Block Day 3: Tempo + Sprints
  {
    id: 'w092',
    title: 'Block Day 3: Tempo + Sprints',
    category: 'TEMPO',
    description: 'Final block day — aerobic work with neuromuscular maintenance',
    purpose: 'Final block day — aerobic work with neuromuscular maintenance',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Final block day — aerobic work with neuromuscular maintenance' },
      { name: '80% effort', zone: 'Z3', powerLow: 75, powerHigh: 85, durationSecs: 2400, coachNote: '80% FTP', purpose: 'Final block day — aerobic work with neuromuscular maintenance' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 900, coachNote: '65% FTP', purpose: 'Final block day — aerobic work with neuromuscular maintenance' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Final block day — aerobic work with neuromuscular maintenance' }
    ],
  },

  // W093 – Race Day Warm-Up (Road Race)
  {
    id: 'w093',
    title: 'Race Day Warm-Up (Road Race)',
    category: 'BASE',
    description: 'Optimal activation before mass-start road race',
    purpose: 'Optimal activation before mass-start road race',
    zone: 'Z1',
    duration: 25,
    difficultyScore: 1,
    intervals: () => [
      { name: '50% effort', zone: 'Z1', powerLow: 45, powerHigh: 55, durationSecs: 300, coachNote: '50% FTP', purpose: 'Optimal activation before mass-start road race' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 300, coachNote: '65% FTP', purpose: 'Optimal activation before mass-start road race' },
      { name: '80% effort', zone: 'Z3', powerLow: 75, powerHigh: 85, durationSecs: 120, coachNote: '80% FTP', purpose: 'Optimal activation before mass-start road race' },
      { name: '95% effort', zone: 'Z4', powerLow: 90, powerHigh: 100, durationSecs: 60, coachNote: '95% FTP', purpose: 'Optimal activation before mass-start road race' }
    ],
  },

  // W094 – Race Day Warm-Up (Time Trial)
  {
    id: 'w094',
    title: 'Race Day Warm-Up (Time Trial)',
    category: 'BASE',
    description: 'Peak activation for maximal sustained effort',
    purpose: 'Peak activation for maximal sustained effort',
    zone: 'Z2',
    duration: 30,
    difficultyScore: 1,
    intervals: () => [
      { name: '55% effort', zone: 'Z2', powerLow: 50, powerHigh: 60, durationSecs: 480, coachNote: '55% FTP', purpose: 'Peak activation for maximal sustained effort' },
      { name: '70% effort', zone: 'Z2', powerLow: 65, powerHigh: 75, durationSecs: 300, coachNote: '70% FTP', purpose: 'Peak activation for maximal sustained effort' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 180, coachNote: '85% FTP', purpose: 'Peak activation for maximal sustained effort' },
      { name: '100% effort', zone: 'Z4', powerLow: 95, powerHigh: 105, durationSecs: 60, coachNote: '100% FTP', purpose: 'Peak activation for maximal sustained effort' },
      { name: '60% effort', zone: 'Z2', powerLow: 55, powerHigh: 65, durationSecs: 180, coachNote: '60% FTP', purpose: 'Peak activation for maximal sustained effort' }
    ],
  },

  // W095 – Interval Day Warm-Up (Detailed)
  {
    id: 'w095',
    title: 'Interval Day Warm-Up (Detailed)',
    category: 'BASE',
    description: 'Thorough preparation for hard interval session',
    purpose: 'Thorough preparation for hard interval session',
    zone: 'Z1',
    duration: 20,
    difficultyScore: 1,
    intervals: () => [
      { name: '50% effort', zone: 'Z1', powerLow: 45, powerHigh: 55, durationSecs: 300, coachNote: '50% FTP', purpose: 'Thorough preparation for hard interval session' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 300, coachNote: '65% FTP', purpose: 'Thorough preparation for hard interval session' },
      { name: '75% effort', zone: 'Z3', powerLow: 70, powerHigh: 80, durationSecs: 180, coachNote: '75% FTP', purpose: 'Thorough preparation for hard interval session' },
      { name: '55% effort', zone: 'Z2', powerLow: 50, powerHigh: 60, durationSecs: 180, coachNote: '55% FTP', purpose: 'Thorough preparation for hard interval session' }
    ],
  },

  // W096 – Zwift Race Prep: Pen Start Simulation
  {
    id: 'w096',
    title: 'Zwift Race Prep: Pen Start Simulation',
    category: 'BASE',
    description: 'Survive the opening surge of virtual races',
    purpose: 'Survive the opening surge of virtual races',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Survive the opening surge of virtual races' },
      { name: '100% effort', zone: 'Z4', powerLow: 95, powerHigh: 105, durationSecs: 180, coachNote: '100% FTP', purpose: 'Survive the opening surge of virtual races' },
      { name: '85% effort', zone: 'Z3', powerLow: 80, powerHigh: 90, durationSecs: 300, coachNote: '85% FTP', purpose: 'Survive the opening surge of virtual races' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Survive the opening surge of virtual races' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Survive the opening surge of virtual races' }
    ],
  },

  // W097 – Zwift Race Finish Kicker
  {
    id: 'w097',
    title: 'Zwift Race Finish Kicker',
    category: 'BASE',
    description: 'Sprint finish after sustained threshold',
    purpose: 'Sprint finish after sustained threshold',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Sprint finish after sustained threshold' },
      { name: '90% effort', zone: 'Z4', powerLow: 85, powerHigh: 95, durationSecs: 480, coachNote: '90% FTP', purpose: 'Sprint finish after sustained threshold' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 240, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sprint finish after sustained threshold' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sprint finish after sustained threshold' }
    ],
  },

  // W098 – Laursen Pmax/Tmax Protocol
  {
    id: 'w098',
    title: 'Laursen Pmax/Tmax Protocol',
    category: 'BASE',
    description: 'Individualized VO2max intervals based on personal physiology',
    purpose: 'Individualized VO2max intervals based on personal physiology',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Individualized VO2max intervals based on personal physiology' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Individualized VO2max intervals based on personal physiology' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Individualized VO2max intervals based on personal physiology' }
    ],
  },

  // W099 – Laursen Supramaximal Sprint Protocol
  {
    id: 'w099',
    title: 'Laursen Supramaximal Sprint Protocol',
    category: 'SPRINT',
    description: 'Sprint-based performance improvement for trained cyclists',
    purpose: 'Sprint-based performance improvement for trained cyclists',
    zone: 'Z1-Z2',
    duration: 65,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 900, coachNote: 'Easy spin, build gradually', purpose: 'Sprint-based performance improvement for trained cyclists' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Sprint-based performance improvement for trained cyclists' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Sprint-based performance improvement for trained cyclists' }
    ],
  },

  // W100 – Lindsay 80% MAP Protocol
  {
    id: 'w100',
    title: 'Lindsay 80% MAP Protocol',
    category: 'BASE',
    description: 'Race-specific threshold improvement for trained cyclists',
    purpose: 'Race-specific threshold improvement for trained cyclists',
    zone: 'Z1-Z2',
    duration: 80,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Race-specific threshold improvement for trained cyclists' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Race-specific threshold improvement for trained cyclists' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Race-specific threshold improvement for trained cyclists' }
    ],
  },

  // W101 – Stepto Optimal Duration Protocol
  {
    id: 'w101',
    title: 'Stepto Optimal Duration Protocol',
    category: 'BASE',
    description: 'Maximum TT performance improvement (research-optimized)',
    purpose: 'Maximum TT performance improvement (research-optimized)',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximum TT performance improvement (research-optimized)' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 360, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximum TT performance improvement (research-optimized)' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximum TT performance improvement (research-optimized)' }
    ],
  },

  // W102 – Rønnestad 30s MAP with 2:1 Ratio
  {
    id: 'w102',
    title: 'Rønnestad 30s MAP with 2:1 Ratio',
    category: 'BASE',
    description: 'Maximize time ≥90% VO2max using fixed 30s intervals at MAP',
    purpose: 'Maximize time ≥90% VO2max using fixed 30s intervals at MAP',
    zone: 'Z1-Z2',
    duration: 60,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximize time ≥90% VO2max using fixed 30s intervals at MAP' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximize time ≥90% VO2max using fixed 30s intervals at MAP' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximize time ≥90% VO2max using fixed 30s intervals at MAP' }
    ],
  },

  // W103 – High Work:Rest Ratio (5:1)
  {
    id: 'w103',
    title: 'High Work:Rest Ratio (5:1)',
    category: 'BASE',
    description: 'Maximum time-at-intensity with minimal recovery',
    purpose: 'Maximum time-at-intensity with minimal recovery',
    zone: 'Z1-Z2',
    duration: 70,
    difficultyScore: 5,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 1', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 2', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 3', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 4', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 300, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 1', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 2', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 3', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Rep 4', zone: 'Z2', powerLow: 105, powerHigh: 60, durationSecs: 300, coachNote: '60% FTP effort', purpose: 'Maximum time-at-intensity with minimal recovery' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximum time-at-intensity with minimal recovery' }
    ],
  },

  // W104 – Low Work:Rest Ratio Sprint (1:8)
  {
    id: 'w104',
    title: 'Low Work:Rest Ratio Sprint (1:8)',
    category: 'SPRINT',
    description: 'Maximum power output with full recovery',
    purpose: 'Maximum power output with full recovery',
    zone: 'Z1-Z2',
    duration: 55,
    difficultyScore: 3,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Maximum power output with full recovery' },
      { name: '65% effort', zone: 'Z2', powerLow: 60, powerHigh: 70, durationSecs: 600, coachNote: '65% FTP', purpose: 'Maximum power output with full recovery' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Maximum power output with full recovery' }
    ],
  },

  // W105 – Self-Paced 4 × 8 with 2:1 Ratio
  {
    id: 'w105',
    title: 'Self-Paced 4 × 8 with 2:1 Ratio',
    category: 'BASE',
    description: 'Optimized self-paced VO2max accumulation',
    purpose: 'Optimized self-paced VO2max accumulation',
    zone: 'Z1-Z2',
    duration: 75,
    difficultyScore: 7,
    intervals: () => [
      { name: 'Warm-up', zone: 'Z1-Z2', powerLow: 40, powerHigh: 65, durationSecs: 600, coachNote: 'Easy spin, build gradually', purpose: 'Optimized self-paced VO2max accumulation' },
      { name: 'Rest', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 480, coachNote: 'Easy spinning, prepare for next effort', purpose: 'Optimized self-paced VO2max accumulation' },
      { name: 'Cool-down', zone: 'Z1', powerLow: 40, powerHigh: 55, durationSecs: 600, coachNote: 'Easy recovery spinning', purpose: 'Optimized self-paced VO2max accumulation' }
    ],
  },

];

export const RESEARCH_WORKOUTS_BY_ID = new Map(
  RESEARCH_WORKOUTS.map(w => [w.id, w])
);
