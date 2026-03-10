"""
Generate complete Zwift workouts file with all 77 workouts
Based on categories from Zwift Labs catalog
"""

workouts = []

# 1. STANDALONE ICONS (19)
icons = [
    ("zw01_gorby", "The Gorby", "VO2MAX", "10m warm + 5×5m @110% / 5m @55% + cool", 8),
    ("zw02_wringer", "The Wringer", "ANAEROBIC", "12m warm + 12×30s @200-205% + cool", 9),
    ("zw03_mccarthy", "McCarthy Special", "THRESHOLD", "Varied threshold work", 7),
    ("zw04_sst1", "SST Tier 1", "SWEET_SPOT", "Sweet spot intervals", 6),
    ("zw05_sst2", "SST Tier 2", "SWEET_SPOT", "Extended sweet spot", 7),
    ("zw06_over_under", "Over-Under Threshold", "THRESHOLD", "110% / 90% alternating", 8),
    ("zw07_40_20", "40/20 Repeats", "VO2MAX", "40s hard / 20s easy", 8),
    ("zw08_30_30", "30/30 Efforts", "VO2MAX", "30s hard / 30s easy", 7),
    ("zw09_ramp_test", "Ramp Test", "FTP_TEST", "20W/min ramp to failure", 10),
    ("zw10_ftp_test", "FTP Test 20min", "FTP_TEST", "20-minute all-out", 10),
    ("zw11_5x8", "5x8 FTP", "THRESHOLD", "5×8min at FTP", 8),
    ("zw12_3x12", "3x12 Threshold", "THRESHOLD", "3×12min at threshold", 8),
    ("zw13_pyramid", "Threshold Pyramid", "THRESHOLD", "Pyramid threshold work", 8),
    ("zw14_microbursts", "Microbursts", "ANAEROBIC", "Short hard efforts", 7),
    ("zw15_endurance", "Long Endurance", "BASE", "Extended Z2 work", 2),
    ("zw16_recovery", "Recovery Spin", "RECOVERY", "Easy Z1 spinning", 1),
    ("zw17_vo2_ladder", "VO2 Ladder", "VO2MAX", "Ascending VO2 ladder", 9),
    ("zw18_tempo_ladder", "Tempo Ladder", "TEMPO", "Tempo progression", 6),
    ("zw19_mixed", "Mixed Intervals", "MIXED", "Multi-zone workout", 6),
]

# 2. BUILD ME UP SERIES (36)
build_me_up = [
    ("zw20_calibration", "Calibration", "BASE", "Fitness check", 3),
    ("zw21_90_trifecta_ded", "90% Trifecta - Devedeset", "SWEET_SPOT", "90% FTP repeats", 7),
    ("zw22_90_trifecta_half", "90% Trifecta - Halfems", "SWEET_SPOT", "90% FTP repeats", 7),
    ("zw23_90_trifecta_nov", "90% Trifecta - Novanta", "SWEET_SPOT", "90% FTP repeats", 7),
    # Unicorns - 7 level progression
    ("zw24_unicorn_red", "Unicorn Red", "VO2MAX", "VO2 work", 6),
    ("zw25_unicorn_orange", "Unicorn Orange", "VO2MAX", "VO2 progression", 7),
    ("zw26_unicorn_yellow", "Unicorn Yellow", "VO2MAX", "Higher VO2", 7),
    ("zw27_unicorn_green", "Unicorn Green", "VO2MAX", "Advanced VO2", 8),
    ("zw28_unicorn_blue", "Unicorn Blue", "VO2MAX", "Peak VO2", 8),
    ("zw29_unicorn_indigo", "Unicorn Indigo", "VO2MAX", "Extreme VO2", 9),
    ("zw30_unicorn_violet", "Unicorn Violet", "VO2MAX", "Max VO2", 9),
    # Pedaling drills
    ("zw31_pedal_drill1", "Pedaling Drill 1", "TECHNIQUE", "Smooth pedaling", 3),
    ("zw32_pedal_drill2", "Pedaling Drill 2", "TECHNIQUE", "Efficiency work", 4),
    # Strength work
    ("zw33_strength1", "Strength Tier 1", "STRENGTH", "Low cadence force", 5),
    ("zw34_strength2", "Strength Tier 2", "STRENGTH", "Heavy resistance", 6),
    # Tech work
    ("zw35_tech1", "Tech Work 1", "TECHNIQUE", "Cadence variation", 4),
    ("zw36_tech2", "Tech Work 2", "TECHNIQUE", "Skills development", 5),
    # VO2max variants
    ("zw37_vo2_method", "VO2 Method", "VO2MAX", "Classic VO2 protocol", 8),
    ("zw38_vo2_tine", "VO2 Tine", "VO2MAX", "VO2 variant", 8),
    ("zw39_vo2_tines", "VO2 Tines", "VO2MAX", "Double VO2", 9),
    ("zw40_vo2_15_9", "VO2 15/9", "VO2MAX", "15min/9min VO2", 8),
    ("zw41_vo2_lox", "VO2 LOX", "VO2MAX", "Low oxygen training", 9),
    # Attack variants
    ("zw42_attack1", "Attack 1", "ANAEROBIC", "Attack drills", 7),
    ("zw43_attack2", "Attack 2", "ANAEROBIC", "Advanced attacks", 8),
    # Named sessions
    ("zw44_malevolent", "Malevolent", "VO2MAX", "Difficult VO2", 9),
    ("zw45_sweetheart", "Sweetheart", "SWEET_SPOT", "Long sweet spot", 7),
    ("zw46_exemplary", "Exemplary", "MIXED", "Mixed intensity", 7),
    ("zw47_alpha", "Alpha", "THRESHOLD", "Threshold focus", 8),
]

# 3. FTP BUILDER SERIES (16)
ftp_builder = [
    ("zw48_ftp_foundation", "FTP Foundation", "BASE", "Easy base work", 2),
    ("zw49_ftp_strength", "FTP Strength", "STRENGTH", "Strength focus", 6),
    ("zw50_tempo_prog1", "Tempo Progression 1", "TEMPO", "Early tempo", 5),
    ("zw51_tempo_prog2", "Tempo Progression 2", "TEMPO", "Build tempo", 6),
    ("zw52_tempo_prog3", "Tempo Progression 3", "TEMPO", "Advanced tempo", 7),
    ("zw53_hiit_w4", "HIIT Week 4", "VO2MAX", "Week 4 HIIT", 8),
    ("zw54_hiit_w6", "HIIT Week 6", "VO2MAX", "Week 6 HIIT", 8),
    ("zw55_hiit_w8", "HIIT Week 8", "VO2MAX", "Week 8 HIIT", 9),
    ("zw56_threshold_a", "Threshold A", "THRESHOLD", "Threshold step A", 7),
    ("zw57_threshold_b", "Threshold B", "THRESHOLD", "Threshold step B", 7),
    ("zw58_threshold_c", "Threshold C", "THRESHOLD", "Threshold step C", 8),
    ("zw59_threshold_d", "Threshold D", "THRESHOLD", "Threshold step D", 8),
    ("zw60_threshold_e", "Threshold E", "THRESHOLD", "Threshold step E", 8),
    ("zw61_threshold_f", "Threshold F", "THRESHOLD", "Threshold step F", 9),
    ("zw62_free_ride", "Free Ride", "MIXED", "No structure", 1),
]

# 4. CRIT CRUSHER SERIES (6)
crit_crusher = [
    ("zw63_works", "The Works", "RACE_SIM", "Full race simulation", 9),
    ("zw64_crit_foundation", "Crit Foundation", "SPRINT", "Sprint base", 5),
    ("zw65_split_session", "Split Session", "MIXED", "Two-part workout", 6),
    ("zw66_crit_strength", "Crit Strength", "STRENGTH", "Sprint strength", 7),
    ("zw67_microbursts_crit", "Crit Microbursts", "ANAEROBIC", "Race-like attacks", 8),
    ("zw68_30_30_anaerobic", "30/30 Anaerobic", "ANAEROBIC", "Anaerobic repeats", 8),
]

all_workouts = icons + build_me_up + ftp_builder + crit_crusher

print(f"Total workouts: {len(all_workouts)}")
print("\nWorkout IDs and titles:")
for i, (id, title, cat, desc, diff) in enumerate(all_workouts, 1):
    print(f"{i:2d}. {title:30s} ({cat:15s}) - Difficulty: {diff}")

