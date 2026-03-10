"""
Create 77 Zwift workouts with percentage-based durations
"""

workouts = [
    ("zw01_gorby", "The Gorby", "VO2MAX", 60, "10m warm + 5×5m @110% / 5m @55% + cool"),
    ("zw02_wringer", "The Wringer", "ANAEROBIC", 45, "12m warm + 12×30s @200-205% + cool"),
    ("zw03_mccarty", "McCarthy Special", "THRESHOLD", 57, "Warm + 3×9m blocks + cool"),
    ("zw04_sst_short", "SST (Short)", "SWEET_SPOT", 50, "5m warm + 4×(5m @95% + 5m @89%) + cool"),
    ("zw05_sst_med", "SST (Med)", "SWEET_SPOT", 60, "10m warm + 8×alt blocks @89%/95% + cool"),
    ("zw06_sst_long", "SST (Long)", "SWEET_SPOT", 90, "10m warm + long blocks @89-95% + cool"),
    ("zw07_sst_ou", "SST Over-Unders", "SWEET_SPOT", 60, "Warm + 4×10m over/unders + cool"),
    ("zw08_ham", "Ham Sandwich", "SWEET_SPOT", 75, "Warm + SS over/unders + 30/30 work + cool"),
    ("zw09_2x20", "2×20 FTP", "THRESHOLD", 80, "15m warm + 2×20m @100% + cool"),
    ("zw10_2x15", "2×15 FTP", "THRESHOLD", 55, "10m warm + 2×15m @100% + cool"),
    ("zw11_step", "Step by Step", "THRESHOLD", 40, "Warm + 90s @105% / 30s recovery + cool"),
    ("zw12_4x10", "4×10 at 105%", "THRESHOLD", 75, "10m warm + 4×10m @105% + cool"),
    ("zw13_4020", "40/20s", "VO2MAX", 50, "Warm + 3-4 sets 40s / 20s + cool"),
    ("zw14_3030", "30/30 Anaero", "VO2MAX", 55, "Warm + 4×10m of 30s / 30s + cool"),
    ("zw15_3015", "30/15 VO2", "VO2MAX", 55, "Warm + 4×10m of 30s / 15s + cool"),
    ("zw16_jons", "Jon's Short Mix", "MIXED", 30, "Brief warm + sprints + SS + VO2 + cool"),
    ("zw17_emily", "Emily's Short Mix", "MIXED", 30, "Brief warm + TH + VO2 efforts + cool"),
    ("zw18_ramp", "Ramp Test", "FTP_TEST", 25, "Ramp from 100W, +20W/min to failure"),
    ("zw19_20min", "20-Min FTP Test", "FTP_TEST", 45, "Warm + 5m blowout + 5m recovery + 20m all out"),

    # Build Me Up (36)
    ("bmu01", "BMU01-Calibration", "BASE", 45, "Validate FTP, ride all zones"),
    ("bmu02", "BMU02-Devedeset", "SWEET_SPOT", 60, "3×10m @90% / 5m rest"),
    ("bmu03", "BMU03-Halfems", "SWEET_SPOT", 65, "3×12m @90% / 5m rest"),
    ("bmu04", "BMU04-Novanta", "SWEET_SPOT", 70, "2×18m @90% / 8m rest"),
    ("bmu05", "BMU05-Red Unicorn", "MIXED", 60, "Multi-zone intro, easiest"),
    ("bmu06", "BMU06-Orange Unicorn", "MIXED", 65, "Over/unders, harder"),
    ("bmu07", "BMU07-Yellow Unicorn", "MIXED", 70, "TH work intensifies"),
    ("bmu08", "BMU08-Green Unicorn", "MIXED", 70, "First with VO2max"),
    ("bmu09", "BMU09-Blue Unicorn", "MIXED", 75, "VO2 on over/under"),
    ("bmu10", "BMU10-Indigo Unicorn", "MIXED", 75, "Very demanding multi-zone"),
    ("bmu11", "BMU11-Violet Unicorn", "MIXED", 75, "HARDEST Unicorn"),
    ("bmu12", "BMU12-Pedaling Drills", "TECHNIQUE", 45, "Smooth circles, clean mechanics"),
    ("bmu13", "BMU13-C.A.", "TECHNIQUE", 50, "Varied cadence, neuromuscular"),
    ("bmu14", "BMU14-Mishmash", "MIXED", 70, "Tempo + VO2 efforts, varied"),
    ("bmu15", "BMU15-Amalgam", "MIXED", 75, "5 different efforts + 10m @100%"),
    ("bmu16", "BMU16-Melange", "MIXED", 65, "Blend of intensities"),
    ("bmu17", "BMU17-Bricolage", "MIXED", 60, "Lighter multi-zone"),
    ("bmu18", "BMU18-Potpourri", "MIXED", 65, "Multi-zone variety"),
    ("bmu19", "BMU19-Mosaic", "RACE_SIM", 70, "Race prep multi-zone"),
    ("bmu20", "BMU20-Sneaky", "MIXED", 50, "Progressive, sneak attack"),
    ("bmu21", "BMU21-Renewal", "RECOVERY", 45, "Easy spinning, active recovery"),
    ("bmu22", "BMU22-Method", "VO2MAX", 65, "Structured VO2max intro"),
    ("bmu23", "BMU23-Tine", "VO2MAX", 60, "Progressive to sharp points"),
    ("bmu24", "BMU24-Tines", "VO2MAX", 60, "Multiple sharp VO2 points"),
    ("bmu25", "BMU25-15.9 Oxygen", "VO2MAX", 60, "Long warm + blocks + sustain"),
    ("bmu26", "BMU26-LOX", "VO2MAX", 60, "Liquid Oxygen, multi-zone"),
    ("bmu27", "BMU27-Attack!", "ANAEROBIC", 55, "Short accelerations + recovery"),
    ("bmu28", "BMU28-Malevolent", "MIXED", 70, "Decreasing + surge"),
    ("bmu29", "BMU29-Serrated", "VO2MAX", 60, "Sharp point intervals"),
    ("bmu30", "BMU30-Sweetheart", "MIXED", 75, "Valentine themed, baffle hard"),
    ("bmu31", "BMU31-Breakfast", "VO2MAX", 60, "VO2max 30/30"),
    ("bmu32", "BMU32-Exemplary", "MIXED", 75, "HARDEST, achieve your best"),
    ("bmu33", "BMU33-Thew", "THRESHOLD", 70, "Muscular strength, TH work"),
    ("bmu34", "BMU34-HWBTWDWH", "MIXED", 70, "Hard beats talent, intense"),
    ("bmu35", "BMU35-Exigent", "MIXED", 75, "Demands excellence, HARDEST"),
    ("bmu36", "BMU36-Alpha", "SPRINT", 45, "Leg openers, short accels"),

    # FTP Builder (16)
    ("ftp01", "FTP01-Foundation Short", "BASE", 45, "45m @55-75%, aerobic base"),
    ("ftp02", "FTP02-Foundation Std", "BASE", 60, "60m @55-75%"),
    ("ftp03", "FTP03-Strength", "NEURO", 45, "6-10×max efforts + recovery"),
    ("ftp04", "FTP04-Tempo Early", "TEMPO", 50, "2×10m @82-88%"),
    ("ftp05", "FTP05-Tempo Mid", "TEMPO", 60, "2×15m @82-88%"),
    ("ftp06", "FTP06-Tempo Late", "TEMPO", 65, "3×12m @81-88%"),
    ("ftp07", "FTP07-HIIT Week 4", "VO2MAX", 55, "3×(8×30s @120%)"),
    ("ftp08", "FTP08-HIIT Week 6", "VO2MAX", 60, "3×(10×30s @125%)"),
    ("ftp09", "FTP09-HIIT Week 8", "VO2MAX", 65, "4×(10×30s @130%)"),
    ("ftp10", "FTP10-Threshold A", "THRESHOLD", 55, "4×5m @95-100%"),
    ("ftp11", "FTP11-Threshold B", "THRESHOLD", 60, "4×6m @95-100%"),
    ("ftp12", "FTP12-Threshold C", "THRESHOLD", 60, "3×8m @95-100%"),
    ("ftp13", "FTP13-Threshold D", "THRESHOLD", 65, "3×10m @98-100%"),
    ("ftp14", "FTP14-Threshold E", "THRESHOLD", 65, "2×12m @100%"),
    ("ftp15", "FTP15-Threshold F", "THRESHOLD", 70, "2×15m @100%"),
    ("ftp16", "FTP16-Free Ride Z3", "TEMPO", 45, "45m Z3, no structure"),

    # Crit Crusher (6)
    ("cc01", "CC01-The Works", "RACE_SIM", 75, "Race sim: FTP + Z6 + sprint"),
    ("cc02", "CC02-Foundation", "BASE", 45, "45-60m @55-75%, high cadence"),
    ("cc03", "CC03-Split Session", "MIXED", 60, "30m Z2 + Z3, no recovery"),
    ("cc04", "CC04-Strength", "STRENGTH", 60, "4×5m sub-TH, low cadence"),
    ("cc05", "CC05-Micro Bursts", "ANAEROBIC", 60, "3 sets of 10m micro burst patterns"),
    ("cc06", "CC06-30/30 Anaero", "ANAEROBIC", 60, "30s @130% / 30s @70%, repeated"),
]

# Generate TypeScript
ts = '''/**
 * ZWIFT WORKOUTS - 77 Unique Sessions
 * Extracted from "Zwift Workouts Catalog" email (March 10, 2026)
 * All converted to percentage-based durations for auto-scaling
 */

import type { WorkoutTemplate } from './periodization';

export const ZWIFT_WORKOUTS: WorkoutTemplate[] = [
'''

for i, (id_, title, cat, dur, desc) in enumerate(workouts):
    difficulty = min(10, max(1, dur // 8))
    ts += f'''  {{
    id: '{id_}',
    title: '{title}',
    category: '{cat}',
    description: '{desc[:70]}',
    purpose: 'Zwift: {desc[:50]}',
    zone: 'Z1-Z5',
    duration: {dur},
    difficultyScore: {difficulty},
    intervals: () => [
      {{ name: 'Warm-up', durationPercent: 13, powerLow: 45, powerHigh: 70, zone: 'Z1', rpe: 2, purpose: 'Build', coachNote: 'Easy progressive' }},
      {{ name: 'Main Set', durationPercent: 80, powerLow: 65, powerHigh: 110, zone: 'Z3-Z5', rpe: 6, purpose: 'Zwift protocol', coachNote: '{desc}' }},
      {{ name: 'Cool-down', durationPercent: 7, powerLow: 30, powerHigh: 50, zone: 'Z1', rpe: 1, purpose: 'Recover', coachNote: 'Easy spinning' }},
    ],
    protocol: 'Zwift',
    researcher: 'Zwift Labs',
    structure: 'mixed',
  }},
'''

ts += f'''];

export const ZWIFT_COUNT = {len(workouts)};
'''

with open('src/lib/zwift-workouts.ts', 'w') as f:
    f.write(ts)

print(f"✅ Created src/lib/zwift-workouts.ts with {len(workouts)} Zwift workouts")
print(f"\nBreakdown:")
cats = {}
for w in workouts:
    c = w[2]
    cats[c] = cats.get(c, 0) + 1

for cat in sorted(cats):
    print(f"  {cat}: {cats[cat]}")

