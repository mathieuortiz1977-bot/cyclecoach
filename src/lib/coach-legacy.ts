// Coach Commentary Engine — personality-driven interval notes

export type CoachTone = "DARK_HUMOR" | "MOTIVATIONAL" | "TECHNICAL" | "MIXED";

interface CommentaryPool {
  warmup: string[];
  cooldown: string[];
  recovery: string[];
  endurance: string[];
  sweetspot: string[];
  tempo: string[];
  threshold: string[];
  vo2max: string[];
  anaerobic: string[];
  sprint: string[];
  cadence: string[];
  saturday: string[];
}

const commentary: CommentaryPool = {
  warmup: [
    "Easy spin to wake the legs up. Think of it as foreplay for suffering.",
    "15 minutes of nothing. Enjoy it. It's the last time your legs won't hurt today.",
    "Warm up like you mean it. Cold muscles tear. Cold egos bruise. Neither heals fast.",
    "Spin easy. Let the blood flow. Let the dread build. Both are necessary.",
    "The warmup is free. Everything after this costs something.",
    "Easy spinning. Your legs don't know what's coming. Lucky them.",
  ],
  cooldown: [
    "Spin it out. You survived. Barely, but it counts.",
    "Cool down. Let the lactic acid know the eviction notice has been served.",
    "Easy spinning. Reflect on your life choices that led you to indoor cycling.",
    "5 minutes easy. Your legs are filing a formal complaint. Noted and ignored.",
    "Cool down spin. The workout is done. The adaptation is just beginning.",
    "Wind it down. Tomorrow's legs will thank today's discipline.",
  ],
  recovery: [
    "Recovery spin. If your ego hurts more than your legs, you're doing it right.",
    "Z1 only. If you go harder, you're not recovering — you're just being insecure.",
    "Easy day. Your neighbor will pass you. Your grandma might pass you. Stay in zone.",
    "Recovery is training. Say it again. Recovery. Is. Training.",
    "Spin like you're pedaling through a meadow. Smell the flowers. Ignore the power meter.",
    "The base is the house. You can't decorate a house with no walls. Stay easy.",
  ],
  endurance: [
    "Z2 endurance. Boring? Yes. Building your aerobic engine? Also yes. Deal with it.",
    "Long steady effort. This is where fat becomes fuel and patience becomes power.",
    "Endurance work. Not sexy, not Instagram-worthy, but absolutely essential.",
    "Hold Z2. If you can't talk in full sentences, you're going too hard. If you can sing, harder.",
    "This is the work nobody sees but everybody benefits from. Like flossing.",
    "Aerobic base building. Your mitochondria are multiplying. You're basically a science experiment.",
  ],
  sweetspot: [
    "Sweet spot: 88-93% FTP. Uncomfortable but sustainable — like a family dinner. Smile through it.",
    "20 minutes at sweet spot. Right in that magical zone where you're suffering but not dying.",
    "Sweet spot is called that because it's the sweet spot between 'this is fine' and 'I want to quit.'",
    "88-93% FTP. You'll want to quit at minute 12. Don't. The gains happen in the last 8.",
    "The sweet spot: maximum training stimulus for minimum recovery cost. Economics, but for legs.",
    "Hold steady. Your brain will tell you to stop. Your brain is wrong. Your coach is right.",
    "Sweet spot intervals. Think of each minute as a deposit in the Bank of FTP.",
    "This is the most time-efficient zone in cycling. You're basically printing watts.",
  ],
  tempo: [
    "Tempo repeats. Not hard enough to brag about, not easy enough to ignore. The middle child of cycling.",
    "3x15 at tempo. Think of it as a conversation you can hold, but you'd rather not.",
    "Tempo zone. You should be able to talk, but only in short, angry sentences.",
    "76-87% FTP. Find a rhythm and hold it like your life depends on it. It doesn't, but pretend.",
    "Tempo is the foundation of everything above it. Skip this and your threshold crumbles.",
    "Steady tempo. This builds the engine. Everything else just tunes it.",
  ],
  threshold: [
    "2x20 at FTP. The first one feels manageable. The second one is where you find out if you actually want to get faster or if you just like buying bike parts.",
    "Threshold work. This is your hour of power, compressed into intervals of pure determination.",
    "FTP intervals. The watts don't lie. Neither does the suffering.",
    "95-100% FTP. Welcome to the pain cave. There's no WiFi but the gains are excellent.",
    "Over-unders: alternating between 'this is hard' and 'this is really hard.' Enjoy.",
    "Threshold repeats. Your body wants to quit. Your mind wants to quit. Only your training plan disagrees.",
    "Hold FTP. If you can hold a conversation, you're sandbagging. If you can't breathe, dial it back 2%.",
    "This is where last month's base work pays off. Trust the process.",
  ],
  vo2max: [
    "5x3min at 120% FTP. Yes, all five. No, you can't negotiate. Your lungs will hate you but your FTP will thank you in 6 weeks.",
    "VO2max intervals. Short enough that you can survive them. Long enough that you'll question your hobbies.",
    "3 minutes at 115%. It's only 180 seconds. You've waited longer for coffee.",
    "VO2max work. This is the express elevator to fitness. The ride is rough but the view from the top is worth it.",
    "120% FTP. Your heart rate will be in the stratosphere. Your face will be a color not found in nature.",
    "High intensity intervals. This is where champions are forged and where weekend warriors find religion.",
    "4x4min at VO2max. Each one harder than the last. That's not a bug, it's a feature.",
    "If you're not seeing spots by the last interval, you went too easy on the first four.",
  ],
  anaerobic: [
    "30-second all-out sprints. Brief. Violent. Effective. Like a bar fight, but on a bike.",
    "Anaerobic capacity work. Your muscles will scream. Your neighbors might hear. Close the windows.",
    "Sprint intervals. Empty the tank. Then find a tank you didn't know existed. Empty that too.",
    "121-150% FTP. This is above your threshold. Way above. Think 'controlled explosion.'",
    "Short and sharp. The kind of effort that makes you reconsider the entire sport.",
    "Neuromuscular work. Teaching your muscles to fire fast. Think less 'diesel engine', more 'rocket launch.'",
  ],
  sprint: [
    "8x15s all-out, 3min rest. Short enough that you can't quit mid-interval. Long enough rest that you have no excuse not to go full gas.",
    "Sprint! Pretend you're being chased. By a dog. A fast dog. With anger issues.",
    "Maximum effort for 15 seconds. In the grand scheme of life, you can do anything for 15 seconds.",
    "All-out sprint. Don't think. Just smash. Analysis is for after.",
    "Sprint repeats. Each one should feel like you're trying to rip the pedals off the crank.",
  ],
  cadence: [
    "High cadence drills. Spin at 110+ RPM without bouncing. Your saddle is not a trampoline.",
    "Cadence work: 100-110 RPM. Keep it smooth. Grinding is for coffee, not cycling.",
    "Single-leg drills. Find the dead spot in your pedal stroke. Kill it.",
    "Low cadence force reps: 60 RPM at tempo power. Feel every muscle fiber. Name them if you want.",
    "Spin-ups to 130 RPM. Stay smooth. If you're bouncing, you've gone too far. Dial it back.",
    "Pedaling efficiency work. The goal: circles, not squares. Make the bike purr.",
  ],
  saturday: [
    "Weekend warrior time. 100km+ in the Colombian mountains. Pack dignity — you'll need it.",
    "Free ride day. The road doesn't care about your FTP. It only cares about your willpower.",
    "Saturday long ride. Eat before you're hungry, drink before you're thirsty, stop before you're dead.",
    "Ride to a bakery. Eat everything. You earned it. This IS the training.",
    "The Saturday ride is where indoor watts meet outdoor reality. Reality usually wins.",
    "Long ride day. Your legs know the indoor work. Now show them what it was all for.",
    "100km with climbing. If you see a light at the end of the tunnel, that's just the next col.",
    "Weekend epic. Bring two bidons, three gels, and one prayer.",
  ],
};

let commentaryIndex: Record<string, number> = {};

export function getCoachNote(type: keyof CommentaryPool, _tone: CoachTone = "MIXED"): string {
  const pool = commentary[type];
  if (!pool || pool.length === 0) return "Push hard. Recover harder.";
  const key = type;
  if (!(key in commentaryIndex)) commentaryIndex[key] = 0;
  const note = pool[commentaryIndex[key] % pool.length];
  commentaryIndex[key]++;
  return note;
}

export function resetCommentaryIndex(): void {
  commentaryIndex = {};
}
