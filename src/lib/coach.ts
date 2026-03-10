// Coach Commentary Engine v2 — Enhanced personality-driven interval notes
// Support for DARK_HUMOR, MOTIVATIONAL, TECHNICAL, MIXED modes
// Longer, smarter, funnier commentary for every interval type

export type CoachTone = "DARK_HUMOR" | "MOTIVATIONAL" | "TECHNICAL" | "MIXED";

interface CommentaryPool {
  warmup: Record<CoachTone, string[]>;
  cooldown: Record<CoachTone, string[]>;
  recovery: Record<CoachTone, string[]>;
  endurance: Record<CoachTone, string[]>;
  sweetspot: Record<CoachTone, string[]>;
  tempo: Record<CoachTone, string[]>;
  threshold: Record<CoachTone, string[]>;
  vo2max: Record<CoachTone, string[]>;
  anaerobic: Record<CoachTone, string[]>;
  sprint: Record<CoachTone, string[]>;
  cadence: Record<CoachTone, string[]>;
  saturday: Record<CoachTone, string[]>;
  ftp_test: Record<CoachTone, string[]>;
  mixed_efforts: Record<CoachTone, string[]>;
  over_under: Record<CoachTone, string[]>;
  progressive: Record<CoachTone, string[]>;
}

const commentary: CommentaryPool = {
  warmup: {
    DARK_HUMOR: [
      "15 minutes of easy spinning. Enjoy this brief window of hope before everything hurts.",
      "Warm up your legs. Cold muscles tear. Cold egos bruise. We're preventing both for now.",
      "Easy spin. Let the dread marinate. The workout proper is coming and it knows where you live.",
      "This is the appetizer course. Savor it. The main course arrives in 15 minutes and it's not pleasant.",
      "Spin easy. Think of this as the final goodbye to your dignity before today's session.",
      "Warm-up blues: the only time in the next 90 minutes where your lungs won't betray you.",
    ],
    MOTIVATIONAL: [
      "Warming up those legs — you've got this! Build momentum, build confidence, build strength.",
      "Easy spin to prepare for greatness. Every champion started with a warm-up like this one.",
      "Your body is ready. Your mind is ready. Let's turn preparation into power.",
      "Gentle spinning builds the foundation for today's breakthroughs. You're on the right track.",
      "Each pedal stroke now is an investment in today's performance. Keep it smooth, keep it flowing.",
      "Embrace the warmth. You're preparing to do something extraordinary. One spin at a time.",
    ],
    TECHNICAL: [
      "Warm-up phase: Z1-Z2 intensity (50-65% FTP). Gradually increase HR from resting to 100-110 bpm.",
      "10-minute easy spin targeting aerobic activation. Heart rate should reach ~120 bpm by minute 10.",
      "Warm-up protocol: Easy cadence (80-90 rpm) for 5 min, then build to 90-100 rpm over next 10 min.",
      "Pre-workout preparation: Activate neuromuscular system in Z1. Target: smooth pedal stroke, steady breathing.",
      "Beginning aerobic engagement phase. Prepare cardiovascular system for main set intensity.",
      "Warm-up: 13-15 minute Z1 effort. Goal: HR at 50-60% max, RPE 2-3, smooth cadence 90-95 rpm.",
    ],
    MIXED: [
      "Let's go. Easy spinning to get the legs turning and the mind focused. This is your moment.",
      "10-15 minutes easy. Your legs might not feel it yet, but your engine is starting to hum.",
      "Warm up like you mean it. Light effort now means you'll have full capacity for what's coming.",
      "Spin it easy. Your aerobic system is waking up, and you're about to ask a lot from it.",
      "The calm before the storm. Enjoy these easy pedal strokes. They're about to get a lot harder.",
      "Rolling warm-up. Getting the blood flowing and the mind in the game. Let's build from here.",
    ],
  },

  cooldown: {
    DARK_HUMOR: [
      "You survived. Barely. Now spin easy while your legs file their formal complaints.",
      "Cool down. Your legs have left the building. Spinning empty shells for the next 5 minutes.",
      "Recovery spin. Your muscles are acidic. Your pride is wounded. Both will heal, slowly.",
      "5-10 minutes of spinning as your body processes what you just put it through. Contemplate life.",
      "Spin it out. The lactic acid needs evicting. Your legs need convincing this is over.",
      "Cool down: the cool-down is the lie you tell yourself that the workout is actually done.",
    ],
    MOTIVATIONAL: [
      "You did it! Easy spinning now as your body adapts and grows stronger from this work.",
      "Cool down with pride. You conquered today. Let those legs recover knowing they've earned it.",
      "Spin easy and celebrate. Your aerobic system is working harder now because of what you just did.",
      "Recovery spinning: where the real adaptation happens. Your effort just started paying dividends.",
      "Easy pedaling now. Your body is healing itself, getting stronger with each turn of the crank.",
      "You crushed it. Spin easy and feel the satisfaction of work well done.",
    ],
    TECHNICAL: [
      "Cool-down phase: Z1 intensity (40-50% FTP), HR dropping to 100-110 bpm over 5 minutes.",
      "Active recovery: Easy Z1 spinning at 80-90 rpm. This accelerates lactate clearance by 40%.",
      "Recovery protocol: 5-10 min Z1 effort. Maintain smooth pedal stroke, deep breathing to aid parasympathetic activation.",
      "Cool-down zone: Keep power <55% FTP. Goal is parasympathetic nervous system activation and recovery mode.",
      "Post-effort recovery: Gradual HR reduction, easy cadence. Target: HR below 100 bpm by minute 5.",
      "Wind-down phase: Z1-Z2 spinning to promote metabolic recovery and muscle repair initiation.",
    ],
    MIXED: [
      "Done and dusted. Spin easy as your body locks in the gains from today's work.",
      "Cool down smooth. Your effort just triggered a cascade of adaptations. Let them happen.",
      "Easy spinning now. The hard part is behind you. The benefits are just beginning.",
      "Recover actively. Gentle pedaling flushes the system and starts the healing process.",
      "Spin it out with confidence. You challenged yourself today and came through.",
      "The final stage: easy recovery spinning as your engine winds down from max effort.",
    ],
  },

  recovery: {
    DARK_HUMOR: [
      "Recovery day. If you go hard, you're not recovering — you're just lying to yourself.",
      "Z1 only, or your ego is bigger than your FTP. It's a recovery day. Act like it.",
      "Spin easy or don't spin at all. There is no in-between. Your body needs actual recovery.",
      "Recovery day: prove you understand that sometimes slower is actually faster.",
      "Easy spinning. If you're tempted to push, remember: rest is where the magic happens.",
      "Z1-only day. Your grandmother will pass you. Your 8-year-old nephew will pass you. Deal with it.",
    ],
    MOTIVATIONAL: [
      "Recovery day is when you become stronger. Light spinning allows your body to heal and adapt.",
      "Easy day to recharge. Your dedication to recovery is as important as your hard efforts.",
      "Spin easy with gratitude. Your body is repairing itself, building the foundation for future breakthroughs.",
      "Recovery day: trusting the process means trusting that easy days make hard days possible.",
      "Gentle spinning. Your body is working at the cellular level to build new strength.",
      "Active recovery: light movement that supports healing while keeping your engine engaged.",
    ],
    TECHNICAL: [
      "Recovery day: Z1 intensity only (40-50% FTP). Target HR 50-60% max HR (~100 bpm).",
      "Easy Z1-Z2 spinning. Power output <55% FTP. Cadence 90-100 rpm to optimize aerobic base work.",
      "Active recovery protocol: Easy spinning at <50% FTP. Enhances blood flow, reduces DOMS, accelerates recovery.",
      "Z1 recovery effort: 30-60 min at easy effort. Low stress allows parasympathetic nervous system activation.",
      "Recovery spin: Maintain Z1 (40-50% FTP) for full duration. Focus on smooth pedal stroke, steady breathing.",
      "Low-intensity active recovery: <55% FTP, low HR, high volume. Builds aerobic base without systemic stress.",
    ],
    MIXED: [
      "Recover with purpose. Easy spinning keeps your aerobic engine warm without stressing the system.",
      "Light day. Your body is recovering, adapting, and getting ready for harder work ahead.",
      "Easy spinning. This is where most cyclists fail — they don't truly recover. Don't be most cyclists.",
      "Recovery day magic: easy effort that lets your body absorb the hard work from before.",
      "Spin easy and smart. Recovery is not laziness. Recovery is training.",
      "Active recovery: staying loose while your body does the real work at the cellular level.",
    ],
  },

  endurance: {
    DARK_HUMOR: [
      "Long Z2 endurance. Boring? Absolutely. Building your aerobic monster? Even more absolutely. Deal with it.",
      "2-4 hours at easy-to-steady effort. Yes, really. No, you can't skip ahead. Your engine will thank you in 8 weeks.",
      "Z2 endurance: Not sexy. Not Instagram-worthy. But absolutely the foundation of everything else you do.",
      "Steady Z2. If you can sing, push harder. If you can't talk, ease off. If you're dying, you're doing it wrong.",
      "Long steady effort: the foundation work nobody sees but everybody benefits from. Like flossing for your FTP.",
      "Endurance ride: hours in the saddle, face in the wind, existential dread in your heart.",
    ],
    MOTIVATIONAL: [
      "Endurance work: building the aerobic engine that powers all your fast efforts. Every minute counts.",
      "Long steady effort: this is where champions are built. Patience now, power later.",
      "Steady Z2 work expands your aerobic capacity and teaches your body to burn fat efficiently.",
      "Endurance base: the unglamorous work that becomes your secret weapon in races and long rides.",
      "Hours in Z2: building the foundation that makes every other workout more effective.",
      "Steady effort, strong mind. You're developing the work capacity that sets apart the very best.",
    ],
    TECHNICAL: [
      "Endurance work: Z2 intensity (65-75% FTP) for 2-4+ hours. Builds aerobic power and fat oxidation.",
      "Long steady state: maintain 75-85% FTP constant effort. HR should be steady at 70-80% max HR.",
      "Base building protocol: Z2 steady effort (65-75% FTP) with cadence 90-95 rpm. Duration: 2-4 hours.",
      "Aerobic capacity expansion: Sustain 70-75% FTP for extended duration. Increases lactate threshold via steady work.",
      "Fat oxidation training: Z2 for 2-3+ hours optimizes mitochondrial density and fat-burning capacity.",
      "Zone 2 endurance: 60-75 minutes minimum, up to 4+ hours. Cadence 85-100 rpm, HR 60-70% max.",
    ],
    MIXED: [
      "Endurance day. Long, steady, building. This is where the real work happens.",
      "Z2 steady effort. Not thrilling, but absolutely fundamental. Your future self will thank you.",
      "Hours in the saddle. Hours of building aerobic power. Hours well spent.",
      "Steady Z2: the backbone of every good cyclist's training plan. Trust it.",
      "Long endurance effort: comfortable pace, long duration, massive long-term benefits.",
      "Extended steady work. Build that aerobic engine. Everything else follows from a big motor.",
    ],
  },

  sweetspot: {
    DARK_HUMOR: [
      "Sweet spot: 88-93% FTP. Right in that magical zone where you're suffering but not actively dying. Smile through it.",
      "20-minute sweet spot repeats. The first 10 minutes: 'This is fine.' The last 10: 'Why did I choose this sport?'",
      "Sweet spot is called that because it's where maximum gains meet minimum recovery cost. Economics for legs.",
      "88-93% FTP. Uncomfortable but sustainable — like a family dinner with your difficult uncle. Just breathe through it.",
      "You'll want to quit at minute 12. You won't. The adaptation happens in those final 8 minutes of suffering.",
      "Sweet spot intervals: the most time-efficient zone in cycling. You're basically printing watts while also printing complaints.",
    ],
    MOTIVATIONAL: [
      "Sweet spot power: 88-93% FTP. This is where your aerobic power grows fastest with minimal recovery cost.",
      "Hold this effort with confidence. Sweet spot is the most productive zone you can sustain.",
      "Every second in sweet spot zone is building your FTP. You're literally becoming a better cyclist right now.",
      "Controlled suffering in the sweet spot zone. This effort multiplies your fitness faster than any other training.",
      "20-minute sweet spot: holding this power teaches your body to sustain what was once threshold effort.",
      "Sweet spot repeats: where efficiency meets effectiveness. You're training smart and hard simultaneously.",
    ],
    TECHNICAL: [
      "Sweet spot intervals: 88-93% FTP, sustained effort (15-30 min blocks). Builds lactate threshold via muscular tension.",
      "Sweet spot power: 90% FTP ±3%, cadence 85-95 rpm. HR should be 85-92% max HR, sustainable for duration.",
      "Protocol: 2x20 or 3x15 at sweet spot (88-93% FTP). Recovery: 5-minute Z2. Trains threshold while sparing recovery.",
      "Sweet spot zone: maximum aerobic stimulation (88-93% FTP) without exceeding recovery capacity. Efficiency-optimized.",
      "Sustained sweet spot effort: 88-93% FTP at 88-93 rpm cadence. Targets aerobic power and muscular endurance.",
      "Sweet spot training: 20-minute sustained efforts at 90% FTP. Develops your functional threshold power sustainably.",
    ],
    MIXED: [
      "Sweet spot power: the zone where hard training meets smart training. Hold it steady and hold it proud.",
      "88-93% FTP repeats. Uncomfortable but productive. This is how you build your engine.",
      "Sweet spot suffering: the most efficient way to get faster. Every minute is working for you.",
      "Hold this power. Your threshold is being rebuilt one sweet spot effort at a time.",
      "Sweet spot training: hard enough to matter, sustainable enough to do multiple times. This is the sweet spot.",
      "Steady power at sweet spot intensity. You're right in the zone where the best gains happen.",
    ],
  },

  tempo: {
    DARK_HUMOR: [
      "Tempo repeats. Not hard enough to brag about, not easy enough to ignore. The middle child of cycling training.",
      "76-87% FTP. You can hold a conversation, but only in short, angry sentences.",
      "3x15 at tempo. Think of each rep as a conversation with your respiratory system that neither party is enjoying.",
      "Tempo zone: the foundation of everything above it. Skip this and your threshold crumbles like a cookie.",
      "Steady tempo effort. Your Strava segment time will slightly improve. Your dignity will not.",
      "Tempo: building the engine. Everything else just fine-tunes this machine you're constructing right now.",
    ],
    MOTIVATIONAL: [
      "Tempo repeats: building the sustainable power that becomes your secret weapon in long efforts.",
      "Hold this effort with focus. Tempo work is the foundation of all serious training.",
      "Steady tempo power: teaching your body to sustain effort that was once uncomfortable.",
      "Tempo intervals: gradually pushing what you can hold steadily, building toward threshold.",
      "3x15 at tempo: each effort makes the next one feel easier and teaches resilience.",
      "Tempo training: foundational work that makes every harder zone more accessible.",
    ],
    TECHNICAL: [
      "Tempo intervals: 76-87% FTP, sustained 15-30 min blocks. Builds aerobic power and muscular endurance foundation.",
      "Tempo zone (80% FTP): sustain 3x15-20 min. HR 75-85% max. Recovery: 3-5 min between efforts. Threshold prep.",
      "Protocol: 3x15 at 80% FTP with 5-minute recovery intervals. Teaches sustainable hard-but-manageable effort.",
      "Tempo power: 76-87% FTP, cadence 85-95 rpm. Builds threshold capacity via submaximal sustained effort.",
      "Steady-state tempo: 80% FTP for extended duration. Increases lactate clearance capacity gradually.",
      "Tempo work: 76-87% FTP effort. Strengthens aerobic system, builds mental toughness, prepares for threshold.",
    ],
    MIXED: [
      "Tempo repeats: controlled hard effort that builds your sustainable power base.",
      "Hold steady tempo. You're teaching your body to sustain what once felt difficult.",
      "Tempo work: the foundation of threshold power. Every rep strengthens the base.",
      "Steady effort at tempo pace. Not VO2max pain, but genuine fitness-building stimulus.",
      "Tempo intervals: the unglamorous work that becomes your most important power zone.",
      "Hold this tempo. You're right at the edge of sustainability, and that's exactly where growth happens.",
    ],
  },

  threshold: {
    DARK_HUMOR: [
      "2x20 at FTP. The first one feels manageable. The second one is where you find out if you actually want to get faster.",
      "FTP intervals: your hour of power, compressed into 20-minute efforts of pure determination and regret.",
      "95-100% FTP. Welcome to the pain cave. The WiFi is terrible but the gains are excellent.",
      "Threshold repeats: holding your limit effort long enough to actually raise the limit. Suffering is the curriculum.",
      "2x20 at threshold. Your legs will beg for mercy. They won't get it. That's the whole point.",
      "Over-unders: alternating between 'this is hard' and 'this is really hard.' There is no middle ground.",
    ],
    MOTIVATIONAL: [
      "FTP repeats: this is where your power truly grows. Every second at threshold raises your limit higher.",
      "Hold your FTP with confidence. This effort is building the power that changes your performance.",
      "Threshold work: the most direct path to becoming significantly faster. You're at the edge, and that's where growth lives.",
      "FTP intervals: transformative training that makes you a stronger cyclist in real races.",
      "2x20 at your limit: holding what was once impossible becomes your new normal.",
      "Threshold training: hard effort that brings immediate and dramatic fitness gains.",
    ],
    TECHNICAL: [
      "FTP intervals: 95-100% FTP, 15-30 min sustained effort (or repeats). Directly increases lactate threshold.",
      "Protocol: 2x20 or 3x15 at FTP (100% baseline). Recovery: 5-10 min Z2. Peak stimulus for threshold adaptation.",
      "Threshold work: sustain 95-100% FTP at 88-95 rpm cadence. HR 92-98% max HR. Trains VO2 max simultaneously.",
      "Over-unders: 30s at 110% FTP / 30s at 90% FTP. Trains threshold neuromuscular power dynamically.",
      "Sustained threshold: 100% FTP for 20-30 min. Increases lactate threshold and aerobic power simultaneously.",
      "Threshold repeats: 15-20 min at 95-105% FTP. Builds lactate buffering capacity and FTP power.",
    ],
    MIXED: [
      "FTP repeats: the foundation of all serious power improvement. You're building your limit.",
      "Hold your threshold effort. This power is your new normal if you commit to it.",
      "Threshold intervals: hard enough to hurt, designed to make you significantly faster.",
      "FTP work: where indoor training transforms into outdoor power. This is real progress.",
      "Sustained threshold effort: uncomfortable but productive. Growth lives at the edge of sustainable effort.",
      "2x20 at threshold: holding power at your limit forces your body to raise that limit higher.",
    ],
  },

  vo2max: {
    DARK_HUMOR: [
      "5x3 at 120% FTP. Yes, all five. No, you can't negotiate. Your lungs will hate you. Your FTP will love you in 6 weeks.",
      "VO2max intervals: short enough that you can survive them, long enough that you'll question every choice that led here.",
      "120% FTP. Your heart rate will be in the stratosphere. Your face will be a color not found in any Pantone palette.",
      "VO2max work: this is the express elevator to fitness. The ride is rough but the view from the top is worth it.",
      "4x4 at VO2 max. Each one harder than the last. That's not a bug, it's a feature of the system.",
      "If you're not seeing spots by the last interval, you went too easy. Go back and fix that.",
    ],
    MOTIVATIONAL: [
      "VO2max intervals: these powerful efforts expand your aerobic ceiling faster than any other training.",
      "3-minute repeats at 120% FTP: you're teaching your body to sustain power it didn't think possible.",
      "VO2max work: transformative training that elevates your entire fitness profile.",
      "5x3 at VO2 maximum: every interval makes you more powerful, more resilient, more capable.",
      "High-intensity work: where dramatic fitness gains happen. You're becoming the cyclist you're training to be.",
      "VO2max repeats: hard efforts that create significant fitness adaptation in minimal time.",
    ],
    TECHNICAL: [
      "VO2max intervals: 110-130% FTP, 3-5 min efforts. Recovery: 3 min Z2. Peak VO2 stimulus for aerobic power.",
      "Protocol: 4-5x3-4 min at 115-120% FTP. HR 95-100% max. Increases VO2 max and lactate threshold simultaneously.",
      "VO2 max work: sustain 120% FTP for 3-minute blocks. Cadence 85-95 rpm. HR should spike to 95%+ max.",
      "High-intensity intervals: 3-4 min at 115-130% FTP with 2-3 min Z2 recovery. Peak aerobic power training.",
      "VO2max protocol: 3x4 at 120% FTP. These intervals expand your aerobic system maximally.",
      "VO2 maximum intervals: 110-130% FTP, 3-5 minutes. Increases max aerobic power and lactate clearance.",
    ],
    MIXED: [
      "VO2max work: hard intervals that deliver huge fitness gains in short time. Every rep matters.",
      "120% FTP repeats: painful in the moment, powerful for your fitness trajectory.",
      "VO2max intervals: where real power is built. High intensity, high reward.",
      "5x3 at VO2: challenging efforts that make you measurably faster.",
      "High-intensity work: these intervals are your power foundation. Go hard, go consistent.",
      "VO2 max training: short bursts of maximum effort that create maximum fitness adaptation.",
    ],
  },

  anaerobic: {
    DARK_HUMOR: [
      "Anaerobic intervals: controlled explosions that make you reconsider your life choices, one 30-second burst at a time.",
      "121-150% FTP. This is above your threshold. Way above. Think 'controlled explosion with consequences.'",
      "30-second all-out sprints. Brief. Violent. Effective. Like a bar fight, but on a bike, with less jail time.",
      "Anaerobic capacity work: your muscles will scream. Your neighbors might hear. Close the windows.",
      "Sprint efforts at 150% FTP. Emptier tank. Then find a tank you didn't know existed. Empty that too.",
      "Neuromuscular work: teaching your muscles to fire fast. Think less 'diesel engine', more 'rocket launch.'",
    ],
    MOTIVATIONAL: [
      "Anaerobic repeats: these explosive efforts develop power that wins races and conquers climbs.",
      "Short, high-intensity intervals build neuromuscular power that transforms your performance.",
      "Anaerobic work: developing the explosive capacity that separates good cyclists from great ones.",
      "30-second efforts: short duration, massive impact. You're building power that changes everything.",
      "Anaerobic training: where raw power is developed, one hard effort at a time.",
      "Sprint intervals: developing the explosive strength that makes you faster in real riding.",
    ],
    TECHNICAL: [
      "Anaerobic intervals: 121-150% FTP, 20-45 sec efforts. Recovery: 2-4 min. Builds anaerobic capacity.",
      "Protocol: 6-8x30s at 150% FTP with 3-4 min recovery. Increases anaerobic power and neuromuscular firing.",
      "Anaerobic work: 130-150% FTP for 20-45 sec. HR will spike to 98-100% max. Trains peak power output.",
      "Short burst training: 30-45 sec at 130-150% FTP. Develops anaerobic alactic energy system.",
      "Anaerobic repeats: brief, high-power efforts that build explosive strength and neuromuscular coordination.",
      "Anaerobic capacity: 6-10x30-40s at 140-150% FTP. Builds peak power for sprint and climb efforts.",
    ],
    MIXED: [
      "Anaerobic intervals: hard, short, transformative. These efforts build explosive power.",
      "30-second repeats at full power. You're training the system that wins races.",
      "Anaerobic work: maximum effort for brief duration creates maximum power gains.",
      "Sprint intervals: teaching your neuromuscular system to access every watt available.",
      "Explosive efforts: high-intensity work that builds the power for real riding situations.",
      "Anaerobic repeats: brief but potent efforts that develop your peak power capacity.",
    ],
  },

  sprint: {
    DARK_HUMOR: [
      "8x15s all-out, 3-minute rest. Short enough that you can't quit mid-interval. Long enough rest to have no excuses for interval 2.",
      "Sprint repeats: pretend you're being chased. By a dog. A fast dog. With anger management issues.",
      "Maximum effort for 15 seconds. In the grand scheme of life, you can do anything for 15 seconds. Go prove it.",
      "Sprint! Don't think. Just smash. Analysis is for after you're done smashing.",
      "Sprint repeats: each one should feel like you're trying to rip the pedals off the crank. Literally.",
      "All-out sprinting: where your ego goes to fight with your cardiovascular system. Neither wins.",
    ],
    MOTIVATIONAL: [
      "Sprint intervals: developing the explosive power that changes race outcomes.",
      "Maximum effort repeats: these short bursts build the fast-twitch power you need.",
      "Sprinting: training the peak power that makes you a faster cyclist in every situation.",
      "All-out efforts: teaching your body to access maximum power on demand.",
      "Sprint work: where neuromuscular power is built one explosive effort at a time.",
      "Maximum power training: developing the sprint capacity that wins the moments that matter.",
    ],
    TECHNICAL: [
      "Sprint intervals: maximum effort 10-20s, 3-5 min recovery. Recruits Type II muscle fibers for peak power.",
      "Protocol: 8x15s all-out with 3-4 min Z2 recovery. Peak power output training for neuromuscular system.",
      "Sprinting: 20+ sec at 200%+ FTP. HR may exceed max HR briefly. Power focused, not sustainable.",
      "All-out sprint efforts: 10-20 sec at maximum possible power. Full recruitment of anaerobic systems.",
      "Sprint training: brief maximum efforts (10-20s) with sufficient recovery (3-5 min) for full power output.",
      "Maximum sprint efforts: short duration, absolute maximum power. Trains peak wattage and neuromuscular speed.",
    ],
    MIXED: [
      "Sprinting: maximum power for brief duration. This is where your fastest efforts come from.",
      "All-out efforts: short but potent. You're training the system that creates speed.",
      "Sprint intervals: maximum power development in minimal time. Every rep makes you faster.",
      "Full-power repeats: teaching your body to generate maximum watts on demand.",
      "Sprinting: where explosive power is built and race-winning speed is developed.",
      "All-out intervals: maximum effort that develops the peak power you need to dominate.",
    ],
  },

  cadence: {
    DARK_HUMOR: [
      "Cadence work at 110+ RPM: your saddle is not a trampoline. Stay. In. The. Saddle.",
      "High-cadence drills: find your bouncing problem, name it, eradicate it.",
      "Low-cadence force work at 60 RPM: feel every muscle fiber suffer individually.",
      "Single-leg pedaling: find the dead spot in your pedal stroke and destroy it with purpose.",
      "Spin-ups to 130 RPM: stay smooth or you'll fall off. Both outcomes are embarrassing.",
      "Pedaling efficiency work: your goal is circles, not squares. Make the bike purr or suffer judgement.",
    ],
    MOTIVATIONAL: [
      "Cadence training: developing smooth, efficient pedal strokes that save energy and increase speed.",
      "High-cadence work: training muscular smoothness that carries over to all efforts.",
      "Low-cadence strength work: building the power that dominates climbs and hard efforts.",
      "Single-leg drills: developing balanced power and identifying weaknesses to fix.",
      "Cadence variety: teaching your body to be efficient at all cadence ranges.",
      "Pedal stroke efficiency: where technical improvements translate into real power gains.",
    ],
    TECHNICAL: [
      "High-cadence work: 110-130 RPM at easy-moderate power. Develops muscle fiber recruitment efficiency.",
      "Protocol: 5-minute high-cadence blocks at 110-130 RPM, 80-85 rpm cadence. Emphasizes pedal stroke smoothness.",
      "Low-cadence strength: 50-60 RPM at tempo-threshold power. Recruits slow-twitch fibers, builds force.",
      "Single-leg drill: alternate 30s per leg at easy power. Identifies imbalances and improves neuromuscular control.",
      "Cadence variation: high cadence (120+ rpm) for efficiency, low cadence (60 rpm) for strength.",
      "Pedal stroke work: varying cadence to improve smoothness and power across all RPM ranges.",
    ],
    MIXED: [
      "Cadence drills: improving your pedal stroke efficiency for faster, smoother riding.",
      "High-cadence work: training smoothness that makes you faster at all efforts.",
      "Low-cadence strength: building power that helps you dominate on climbs.",
      "Pedal stroke efficiency: where technical work translates into real riding improvement.",
      "Cadence variation: mastering all RPM ranges for maximum efficiency and power.",
      "Smooth pedaling: training the efficiency that saves energy and enables faster pace.",
    ],
  },

  saturday: {
    DARK_HUMOR: [
      "Weekend epic: 100km+ in the Colombian mountains. Pack dignity — you'll desperately need it.",
      "Free ride in the hills: the road doesn't care about your FTP. It only cares about your will.",
      "Saturday long ride: eat before you're hungry, drink before you're thirsty, stop before you're dead.",
      "Epic ride day: ride to a bakery, eat everything, hide the calories in 'training'.",
      "The Saturday ride: where indoor watts meet outdoor reality. Reality usually wins decisively.",
      "Long ride day: your legs remember the indoor work. Show them why it all mattered.",
    ],
    MOTIVATIONAL: [
      "Long outdoor ride: putting all your training into real-world cycling and having an adventure.",
      "Saturday epic: this is where your fitness gets tested in the real world with real climbs.",
      "Weekend riding: where the training translates into the experience you're actually chasing.",
      "Extended outdoor effort: enjoying the fruits of your training while building even more fitness.",
      "Long ride day: combining fitness-building with the joy of riding outdoors.",
      "Saturday adventure: your training comes alive in the mountains and on the roads.",
    ],
    TECHNICAL: [
      "Long ride: 2-4+ hours at variable intensity (Z2-Z3). Builds aerobic capacity and mental toughness.",
      "Protocol: Extended outdoor effort with climbing. Variable intensity: Z2 steady on flats, Z3-Z4 on climbs.",
      "Weekend riding: sustained effort over extended duration at outdoor pace. Tests fitness in real conditions.",
      "Long outdoor effort: 100km+ including climbing. Mixed intensity with focus on aerobic work.",
      "Extended outdoor ride: 3-4+ hours combining Z2 endurance base with Z3-Z4 climbing work.",
      "Long ride day: variable intensity outdoor training. Tests and builds fitness across all zones.",
    ],
    MIXED: [
      "Long outdoor ride: where the indoor training meets real-world cycling with hills and wind.",
      "Saturday epic: your chance to put all that hard work into real riding.",
      "Weekend long ride: aerobic capacity building with the joy of outdoor riding.",
      "Extended outdoor effort: testing your fitness while having an adventure.",
      "Long ride day: combining fitness-building with the experience of real cycling.",
      "Saturday riding: where your training becomes the fitness that carries you through real conditions.",
    ],
  },

  ftp_test: {
    DARK_HUMOR: [
      "FTP test: 20 minutes of suffering to prove you've gotten faster. Or slower. Hopefully faster.",
      "Ramp test to FTP: all-out effort that will show exactly how fit you are and how fragile your ego is.",
      "20-minute all-out: establish your FTP, establish your new baseline for suffering.",
      "FTP testing: the scientific way to quantify your suffering and track its progress.",
      "Ramp test protocol: go until you can't. That's your FTP. That's also your new reality.",
      "FTP establishment: finding the number that will haunt your training for the next 6 weeks.",
    ],
    MOTIVATIONAL: [
      "FTP test: finding your current fitness level so you can train smarter and get stronger.",
      "20-minute all-out: establishing your baseline for targeted, effective training.",
      "Ramp test: measuring your fitness to guide your training and celebrate your progress.",
      "FTP testing: the objective measure of your improvement and your training effectiveness.",
      "Establish your FTP: the foundation for all smart, data-driven training moving forward.",
      "FTP test: proving to yourself how much stronger you've become.",
    ],
    TECHNICAL: [
      "FTP test protocol: 20-minute all-out effort after warm-up. FTP = 95% of average power during test.",
      "Ramp test: 20-minute maximum sustainable effort. Establish your functional threshold power baseline.",
      "FTP testing: 20-minute all-out at your current maximum sustainable power. Average power × 0.95 = new FTP.",
      "Protocol: Warm-up, 20-min max sustainable effort, cool-down. Establishes FTP for training zones.",
      "FTP determination: maximum power you can sustain for 1 hour, measured via 20-minute all-out effort.",
      "FTP test: 20 minutes at maximum effort to establish your current functional threshold power.",
    ],
    MIXED: [
      "FTP test: 20 minutes all-out to establish your fitness and your training zones.",
      "Ramp test: maximum effort to find your current FTP and training baseline.",
      "FTP testing: measuring your fitness so you know exactly how to train.",
      "20-minute all-out: establishing the power that becomes your training foundation.",
      "FTP test: objective measurement of your fitness and progress over time.",
      "Establish your FTP: the number that guides every future training decision.",
    ],
  },

  mixed_efforts: {
    DARK_HUMOR: [
      "Mixed efforts: because apparently one intensity isn't enough. Let's do five.",
      "Variable intensity work: the workout that can't decide what it wants to be, so it's all of them.",
      "Multi-zone training: testing your ability to suffer in multiple ways simultaneously.",
      "Mixed-intensity session: no pattern, no mercy, maximum confusion for your body.",
      "Varied intensity training: the randomness will break your will. And your legs.",
      "Mixed efforts: where your body learns to be hard everywhere because it never knows where to focus.",
    ],
    MOTIVATIONAL: [
      "Mixed-intensity work: training your body to handle all efforts, making you faster everywhere.",
      "Variable intensity training: developing adaptability and resilience across all power zones.",
      "Mixed efforts: building comprehensive fitness by challenging your body at all intensities.",
      "Multi-zone training: becoming faster across the entire power spectrum.",
      "Varied intensity work: training your entire aerobic system to excel at everything.",
      "Mixed-effort session: comprehensive fitness development across all intensities.",
    ],
    TECHNICAL: [
      "Mixed efforts: alternating between Z2-Z5 intensities. Trains aerobic and anaerobic systems simultaneously.",
      "Protocol: Combine base (Z2), tempo (Z3), threshold (Z4-Z5) efforts in single session.",
      "Variable intensity: alternating between multiple zones to stress entire aerobic spectrum.",
      "Mixed-intensity session: combines steady work with hard efforts for comprehensive stimulus.",
      "Multi-zone training: sequential or alternating efforts across different intensity zones.",
      "Mixed efforts: comprehensive training stimulus across multiple power zones in single session.",
    ],
    MIXED: [
      "Mixed-effort session: training at all intensities to develop complete fitness.",
      "Variable intensity: challenging your body across the entire power spectrum.",
      "Multi-zone work: becoming strong everywhere through diverse intensity training.",
      "Mixed efforts: comprehensive training that builds fitness at all levels.",
      "Varied intensity: keeping your body challenged across all power zones.",
      "Mixed-effort training: developing the complete fitness that makes you fast everywhere.",
    ],
  },

  over_under: {
    DARK_HUMOR: [
      "Over-unders: alternating between 'this is hard' and 'this is REALLY hard.' No middle ground exists.",
      "Micro-intervals above and below threshold: teaching your body to tolerate both pain and more pain.",
      "Over-under work: 30 seconds easy, 30 seconds hard, repeat forever. Or at least it feels that way.",
      "Threshold over-unders: the workout that's too hard to go easy and too easy to go really hard.",
      "110% FTP then 90% FTP, repeatedly: your legs will thank you never.",
      "Over-under intervals: where 'manageable' and 'agonizing' blend together into something worse than either.",
    ],
    MOTIVATIONAL: [
      "Over-under intervals: training your body to sustain threshold while developing recovery capacity.",
      "Micro-interval work: alternating hard and harder to expand your threshold range.",
      "Over-unders: building the resilience to handle power fluctuations and maintain high pace.",
      "Threshold over-unders: developing power sustainably through dynamic intensity changes.",
      "Over-under work: training your body to recover and attack within tight power margins.",
      "Micro-interval training: expanding your sustainable power through intelligent intensity variation.",
    ],
    TECHNICAL: [
      "Over-unders: 30-45s at 110-120% FTP / 30-45s at 85-95% FTP, repeated. Builds threshold elasticity.",
      "Protocol: Alternate hard (105% FTP) and easier (95% FTP) 30-second blocks for 10-20 min total.",
      "Over-under structure: 40s hard (110% FTP) / 20s easy (80% FTP). Repeat 12-15 times per interval block.",
      "Micro-intervals: high power (>100% FTP) alternating with moderate (90-95% FTP) efforts.",
      "Over-under training: dynamic threshold work, alternating between hard and recovery power within set.",
      "Threshold over-unders: micro-intervals around FTP to train sustainable hard efforts.",
    ],
    MIXED: [
      "Over-under work: alternating hard and harder to develop threshold resilience.",
      "Micro-intervals: training your body to handle power fluctuations and maintain pace.",
      "Over-unders: dynamic threshold work that's harder and more effective than steady efforts.",
      "Threshold intervals with micro-variation: building sustainable power through intensity shifts.",
      "Over-under work: expanding what you can sustain through intelligent hard-to-harder patterns.",
      "Micro-interval training: developing the adaptive strength that handles real-world demands.",
    ],
  },

  progressive: {
    DARK_HUMOR: [
      "Progressive intervals: starting easy and building into suffering. The gift that keeps on giving.",
      "Build progressively: easy, moderate, hard, harder, hardest. Why settle for one level of pain?",
      "Progressive effort: where every 5 minutes the pain increases and quitting becomes more tempting.",
      "Escalating difficulty: starting manageable, ending impossible. The mountain gets steeper as you climb it.",
      "Progressive resistance: beginning reasonable, finishing desperate. Just like life, but on a bike.",
      "Building intensity: an ascending staircase to suffering. Each step higher than the last.",
    ],
    MOTIVATIONAL: [
      "Progressive intervals: building from easy to hard, teaching your body to sustain increasing power.",
      "Escalating efforts: starting strong and finishing stronger, expanding your power capacity.",
      "Progressive work: climbing the intensity ladder and proving you can handle each new level.",
      "Building intensity: developing the resilience to handle sustained high-power efforts.",
      "Progressive intervals: starting manageable and building to maximum, expanding your capacity.",
      "Escalating efforts: demonstrating your growing power by building intensity progressively.",
    ],
    TECHNICAL: [
      "Progressive intervals: starting at Z2-Z3 (70% FTP), building to Z4-Z5 (100%+ FTP) over time.",
      "Protocol: 5-minute blocks building from 70% → 85% → 100% → 110% FTP across session.",
      "Progressive effort: steady build in power output over extended duration. Tests muscular endurance.",
      "Escalating intensity: beginning at moderate, finishing at threshold or VO2max intensity.",
      "Progressive structure: gradual power increase throughout set or session, final effort at peak intensity.",
      "Building effort: 10-15 minute progressive effort, starting Z2, finishing Z4-Z5.",
    ],
    MIXED: [
      "Progressive intervals: building from manageable to challenging, expanding your capacity.",
      "Escalating efforts: start strong, finish stronger. Building toward greater challenges.",
      "Progressive work: climbing the intensity ladder, proving you're stronger than before.",
      "Building intensity: starting easy, finishing hard, developing complete resilience.",
      "Progressive intervals: expanding what you can do by gradually pushing harder.",
      "Escalating difficulty: building from comfortable to challenging, one step at a time.",
    ],
  },
};

let commentaryIndex: Record<string, Record<CoachTone, number>> = {};

export function getCoachNote(
  type: keyof CommentaryPool,
  tone: CoachTone = "MIXED"
): string {
  const pool = commentary[type];
  if (!pool) return "Push hard. Recover harder.";

  const tonePool = pool[tone] || pool.MIXED;
  if (!tonePool || tonePool.length === 0) return "Push hard. Recover harder.";

  const key = `${type}-${tone}`;
  if (!(key in commentaryIndex)) {
    commentaryIndex[key] = { DARK_HUMOR: 0, MOTIVATIONAL: 0, TECHNICAL: 0, MIXED: 0 };
  }

  const index = commentaryIndex[key][tone] || 0;
  const note = tonePool[index % tonePool.length];
  commentaryIndex[key][tone] = (index + 1) % tonePool.length;

  return note;
}

export function resetCommentaryIndex(): void {
  commentaryIndex = {};
}
