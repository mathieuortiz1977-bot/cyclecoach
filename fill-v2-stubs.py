#!/usr/bin/env python3

"""
Fill in the 20 empty V2 workout stubs with complete interval definitions
"""

from pathlib import Path

# Define complete intervals for each stub based on their descriptions and durations
STUB_INTERVALS = {
    'w126': {  # FTP with 30s Bursts (75 min)
        'desc': 'FTP durability with race-like surges',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Prepare', coachNote: '10 min easy' },
      { name: 'FTP Block 1', durationSecs: 1800, powerLow: 95, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'FTP work', coachNote: '30 min at FTP' },
      { name: 'Rest', durationSecs: 600, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' },
      { name: 'FTP + Surges', durationSecs: 1200, powerLow: 95, powerHigh: 130, zone: 'Z5', rpe: 9, purpose: 'Surges on FTP', coachNote: '20 min with 30s hard every 5 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w127': {  # Threshold with Declining Rest (70 min)
        'desc': 'Lactate tolerance with decreasing recovery',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Prepare', coachNote: '10 min easy' },
      { name: 'TH Rep 1', durationSecs: 600, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Rest 1', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'TH Rep 2', durationSecs: 600, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Rest 2', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'TH Rep 3', durationSecs: 600, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Threshold', coachNote: '10 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w128': {  # VO2max Surge on Threshold (70 min)
        'desc': 'VO2 intervals on FTP base',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Prepare', coachNote: '10 min easy' },
      { name: 'FTP Base', durationSecs: 1200, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'FTP foundation', coachNote: '20 min at FTP' },
      { name: 'VO2 Surge', durationSecs: 120, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: 'VO2 kick', coachNote: '2 min surge' },
      { name: 'Return', durationSecs: 600, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'Back to FTP', coachNote: '10 min' },
      { name: 'VO2 Surge 2', durationSecs: 120, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 9, purpose: 'VO2 kick', coachNote: '2 min surge' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w129': {  # Café Ride (120 min)
        'desc': 'Social endurance with structure',
        'intervals': '''[
      { name: 'Easy Start', durationSecs: 2400, powerLow: 60, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Group warmup', coachNote: '40 min easy conversational' },
      { name: 'Tempo Block', durationSecs: 1800, powerLow: 80, powerHigh: 85, zone: 'Z3', rpe: 6, purpose: 'Mixed pace', coachNote: '30 min tempo' },
      { name: 'Final Easy', durationSecs: 2400, powerLow: 60, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Social finish', coachNote: '40 min easy' }
    ]'''
    },
    'w130': {  # 3-Hour Endurance (180 min)
        'desc': 'Pure aerobic base',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Steady Endurance', durationSecs: 9600, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Aerobic base', coachNote: '160 min easy' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w131': {  # Endurance with Tempo Climbs (120 min)
        'desc': 'Undulating terrain',
        'intervals': '''[
      { name: 'Easy Start', durationSecs: 1800, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Warmup', coachNote: '30 min easy' },
      { name: 'Climb 1', durationSecs: 900, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Climb effort', coachNote: '15 min tempo' },
      { name: 'Easy 1', durationSecs: 1200, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Recovery', coachNote: '20 min easy' },
      { name: 'Climb 2', durationSecs: 900, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Climb effort', coachNote: '15 min tempo' },
      { name: 'Easy 2', durationSecs: 1200, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Recovery', coachNote: '20 min easy' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w132': {  # The Wringer Light (50 min)
        'desc': 'Anaerobic repeats with decreasing rest',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Anaerobic 1', durationSecs: 30, powerLow: 180, powerHigh: 190, zone: 'Z6', rpe: 10, purpose: 'Max power', coachNote: '30s hard' },
      { name: 'Rest 1', durationSecs: 180, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min rest' },
      { name: 'Anaerobic 2', durationSecs: 30, powerLow: 180, powerHigh: 190, zone: 'Z6', rpe: 10, purpose: 'Max power', coachNote: '30s hard' },
      { name: 'Rest 2', durationSecs: 120, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '2 min rest' },
      { name: 'Anaerobic 3', durationSecs: 30, powerLow: 180, powerHigh: 190, zone: 'Z6', rpe: 10, purpose: 'Max power', coachNote: '30s hard' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w133': {  # Sprint Ladder (55 min)
        'desc': 'Multi-duration sprint development',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Sprint 10s', durationSecs: 10, powerLow: 200, powerHigh: 220, zone: 'Z7', rpe: 10, purpose: 'Max sprint', coachNote: '10s' },
      { name: 'Rest', durationSecs: 180, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Sprint 20s', durationSecs: 20, powerLow: 180, powerHigh: 200, zone: 'Z6', rpe: 10, purpose: 'Sprint', coachNote: '20s' },
      { name: 'Rest', durationSecs: 180, powerLow: 50, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Sprint 30s', durationSecs: 30, powerLow: 160, powerHigh: 180, zone: 'Z6', rpe: 9, purpose: 'Sprint', coachNote: '30s' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w134': {  # 20/40 Anaerobic (55 min)
        'desc': 'High power density repeats',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: '20s Hard', durationSecs: 20, powerLow: 150, powerHigh: 160, zone: 'Z6', rpe: 10, purpose: 'Hard effort', coachNote: '20s' },
      { name: '40s Easy', durationSecs: 40, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '40s easy' },
      { name: '20s Hard 2', durationSecs: 20, powerLow: 150, powerHigh: 160, zone: 'Z6', rpe: 10, purpose: 'Hard effort', coachNote: '20s' },
      { name: '40s Easy 2', durationSecs: 40, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '40s easy' },
      { name: '20s Hard 3', durationSecs: 20, powerLow: 150, powerHigh: 160, zone: 'Z6', rpe: 10, purpose: 'Hard effort', coachNote: '20s' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w135': {  # Standing Power (60 min)
        'desc': 'Out-of-saddle power',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Standing 1', durationSecs: 120, powerLow: 130, powerHigh: 140, zone: 'Z5', rpe: 9, purpose: 'Out of saddle', coachNote: '2 min standing' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Standing 2', durationSecs: 120, powerLow: 130, powerHigh: 140, zone: 'Z5', rpe: 9, purpose: 'Out of saddle', coachNote: '2 min standing' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'Standing 3', durationSecs: 120, powerLow: 130, powerHigh: 140, zone: 'Z5', rpe: 9, purpose: 'Out of saddle', coachNote: '2 min standing' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w136': {  # Force-Velocity Contrast (70 min)
        'desc': 'High-torque and high-spin',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Low Cadence (80%)', durationSecs: 600, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Force', coachNote: '10 min low cadence' },
      { name: 'High Cadence (85%)', durationSecs: 600, powerLow: 80, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Speed', coachNote: '10 min high cadence' },
      { name: 'Low Cadence 2', durationSecs: 600, powerLow: 85, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Force', coachNote: '10 min low cadence' },
      { name: 'High Cadence 2', durationSecs: 600, powerLow: 80, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Speed', coachNote: '10 min high cadence' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w137': {  # Low-Cadence Threshold (70 min)
        'desc': 'Climbing-specific FTP',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Low Cadence FTP 1', durationSecs: 900, powerLow: 95, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'Climb strength', coachNote: '15 min climbing effort' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' },
      { name: 'Low Cadence FTP 2', durationSecs: 900, powerLow: 95, powerHigh: 105, zone: 'Z4', rpe: 8, purpose: 'Climb strength', coachNote: '15 min climbing effort' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w138': {  # Seated/Standing Alternation (65 min)
        'desc': 'Position-specific power',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Seated', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP seated', coachNote: '5 min seated' },
      { name: 'Standing', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP standing', coachNote: '5 min standing' },
      { name: 'Seated 2', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP seated', coachNote: '5 min seated' },
      { name: 'Standing 2', durationSecs: 300, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'FTP standing', coachNote: '5 min standing' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w139': {  # Masters VO2max (70 min)
        'desc': 'Age-appropriate VO2',
        'intervals': '''[
      { name: 'Warm-up Extended', durationSecs: 900, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Extended warmup', coachNote: '15 min easy + progressions' },
      { name: 'VO2 Rep 1', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 8, purpose: 'VO2', coachNote: '3 min' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'VO2 Rep 2', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 8, purpose: 'VO2', coachNote: '3 min' },
      { name: 'Rest', durationSecs: 180, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '3 min' },
      { name: 'VO2 Rep 3', durationSecs: 180, powerLow: 110, powerHigh: 110, zone: 'Z5', rpe: 8, purpose: 'VO2', coachNote: '3 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w140': {  # Masters Sweet Spot (75 min)
        'desc': 'Recovery-friendly FTP work',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'SS Block 1', durationSecs: 1200, powerLow: 88, powerHigh: 92, zone: 'Z3', rpe: 6, purpose: 'Sweet spot', coachNote: '20 min' },
      { name: 'Rest', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min' },
      { name: 'SS Block 2', durationSecs: 1200, powerLow: 88, powerHigh: 92, zone: 'Z3', rpe: 6, purpose: 'Sweet spot', coachNote: '20 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w141': {  # Masters Tempo Endurance (90 min)
        'desc': 'Zone 3 sweet spot',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Tempo', durationSecs: 3600, powerLow: 78, powerHigh: 88, zone: 'Z3', rpe: 6, purpose: 'Zone 3', coachNote: '60 min steady tempo' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w142': {  # Race Eve Sharpener (30 min)
        'desc': 'Nervous system priming',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Activation Surge 1', durationSecs: 30, powerLow: 130, powerHigh: 130, zone: 'Z5', rpe: 8, purpose: 'Nerve activation', coachNote: '30s hard' },
      { name: 'Easy', durationSecs: 180, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Easy', coachNote: '3 min easy' },
      { name: 'Activation Surge 2', durationSecs: 30, powerLow: 130, powerHigh: 130, zone: 'Z5', rpe: 8, purpose: 'Nerve activation', coachNote: '30s hard' },
      { name: 'Cool-down', durationSecs: 300, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' }
    ]'''
    },
    'w143a': {  # 3-Day Taper Day 1 (60 min)
        'desc': '10 easy + 20 at 85% + 2x5 at 95%/55% + 10 CD',
        'intervals': '''[
      { name: 'Easy Start', durationSecs: 600, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Warmup', coachNote: '10 min easy' },
      { name: 'Tempo', durationSecs: 1200, powerLow: 80, powerHigh: 90, zone: 'Z3', rpe: 6, purpose: 'Tempo work', coachNote: '20 min at 85%' },
      { name: 'Hard 1', durationSecs: 300, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'FTP', coachNote: '5 min hard' },
      { name: 'Easy 1', durationSecs: 300, powerLow: 55, powerHigh: 55, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' },
      { name: 'Hard 2', durationSecs: 300, powerLow: 95, powerHigh: 95, zone: 'Z4', rpe: 8, purpose: 'FTP', coachNote: '5 min hard' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w143b': {  # 3-Day Taper Day 2 (45 min)
        'desc': '10 easy + 15 at 70% + 3x1 at 100% + 10 CD',
        'intervals': '''[
      { name: 'Easy Start', durationSecs: 600, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Warmup', coachNote: '10 min easy' },
      { name: 'Base', durationSecs: 900, powerLow: 65, powerHigh: 75, zone: 'Z2', rpe: 4, purpose: 'Steady', coachNote: '15 min at 70%' },
      { name: 'Sprint 1', durationSecs: 60, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Activation', coachNote: '1 min' },
      { name: 'Sprint 2', durationSecs: 60, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Activation', coachNote: '1 min' },
      { name: 'Sprint 3', durationSecs: 60, powerLow: 100, powerHigh: 100, zone: 'Z4', rpe: 8, purpose: 'Activation', coachNote: '1 min' },
      { name: 'Cool-down', durationSecs: 600, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '10 min easy' }
    ]'''
    },
    'w143c': {  # 3-Day Taper Day 3 (30 min) - Race Eve
        'desc': 'W142 sharpener (race eve)',
        'intervals': '''[
      { name: 'Warm-up', durationSecs: 600, powerLow: 50, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Build', coachNote: '10 min easy' },
      { name: 'Surge 1', durationSecs: 20, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 8, purpose: 'Nerve prime', coachNote: '20s hard' },
      { name: 'Easy 1', durationSecs: 180, powerLow: 60, powerHigh: 70, zone: 'Z2', rpe: 3, purpose: 'Easy', coachNote: '3 min easy' },
      { name: 'Surge 2', durationSecs: 20, powerLow: 120, powerHigh: 120, zone: 'Z5', rpe: 8, purpose: 'Nerve prime', coachNote: '20s hard' },
      { name: 'Cool-down', durationSecs: 300, powerLow: 50, powerHigh: 60, zone: 'Z1', rpe: 1, purpose: 'Recovery', coachNote: '5 min easy' }
    ]'''
    },
}

def fill_stubs():
    """Replace empty intervals with complete definitions"""
    filepath = 'src/lib/research-workouts-v2.ts'
    content = Path(filepath).read_text()
    
    count = 0
    for stub_id, stub_data in STUB_INTERVALS.items():
        # Find and replace
        old_pattern = f"id: '{stub_id}'"
        if old_pattern not in content:
            print(f'✗ {stub_id} not found')
            continue
        
        # Find the line with intervals: () => []
        start = content.find(old_pattern)
        next_section = content[start:start+2000]
        
        intervals_pattern = "intervals: () => []"
        if intervals_pattern in next_section:
            # Replace this specific occurrence
            pos = content.find(intervals_pattern, start)
            if pos > 0:
                content = (content[:pos] + 
                          f"intervals: () => {stub_data['intervals']}" +
                          content[pos + len(intervals_pattern):])
                count += 1
                print(f'✓ {stub_id}')
        else:
            print(f'⚠ {stub_id} - intervals not found')
    
    # Write back
    Path(filepath).write_text(content)
    print(f'\n✅ Filled {count}/{len(STUB_INTERVALS)} stubs')

if __name__ == '__main__':
    fill_stubs()
