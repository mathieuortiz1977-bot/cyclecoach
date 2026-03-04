// Saturday Route Database — Medellín, Colombia

export interface RouteData {
  name: string;
  distance: number; // km
  elevation: number; // meters
  description: string;
  region: string;
}

// Routes organized by difficulty tier for progressive loading
export const routes: Record<string, RouteData[]> = {
  // Week 1 / Recovery — 100-110km, ~800-1200m
  easy: [
    {
      name: "Rionegro Loop via Alto de Las Palmas",
      distance: 105,
      elevation: 1200,
      description: "The classic. Medellín → Las Palmas → Rionegro → Llanogrande → return via Santa Elena. You'll share the road with 200 other cyclists. Drafting opportunities everywhere. Coffee stop in Llanogrande is mandatory, not optional.",
      region: "Medellín",
    },
    {
      name: "Valle de Aburrá North",
      distance: 100,
      elevation: 800,
      description: "Medellín → Copacabana → Barbosa → San Pedro de los Milagros → return. Flatter, scenic, café stops mandatory. This is a ride, not a race. Act accordingly. Eat an empanada at every town.",
      region: "Medellín",
    },
    {
      name: "Envigado – El Retiro Easy Loop",
      distance: 102,
      elevation: 1000,
      description: "Envigado → Alto de Las Palmas (partial) → El Retiro → return via old road. A gentler take on the classic climb. Save the hero stuff for next week.",
      region: "Medellín",
    },
  ],
  // Week 2 — 110-120km, ~1500m
  moderate: [
    {
      name: "San Félix + El Retiro",
      distance: 115,
      elevation: 1500,
      description: "Medellín → Las Palmas → El Retiro → San Félix → return. More climbing, fewer cyclists. The views from San Félix will make you forget your legs hurt. Briefly.",
      region: "Medellín",
    },
    {
      name: "Santa Elena – Guarne – Rionegro",
      distance: 112,
      elevation: 1400,
      description: "Up Santa Elena, across to Guarne, loop through Rionegro. Rolling terrain that never lets you fully recover. Like a conversation with your in-laws.",
      region: "Medellín",
    },
    {
      name: "La Ceja via Alto de Las Palmas",
      distance: 118,
      elevation: 1500,
      description: "The full Las Palmas experience, extending to La Ceja. Pack two bidons — there's a café desert between El Retiro and La Ceja where only willpower sustains you.",
      region: "Medellín",
    },
  ],
  // Week 3 — 120-130km, ~1800m
  hard: [
    {
      name: "Alto de La Ceja Full Loop",
      distance: 125,
      elevation: 1800,
      description: "Medellín → Las Palmas → La Ceja → La Unión → El Retiro → return via Santa Elena. The long one. Pack two bidons and your dignity — you'll lose one of them by km 90.",
      region: "Medellín",
    },
    {
      name: "San Vicente Double Climb",
      distance: 128,
      elevation: 1900,
      description: "Out to San Vicente via the back road, return over the main climb. Two major ascents that'll test everything the indoor sessions built. Legs, lungs, and will to live.",
      region: "Medellín",
    },
    {
      name: "Guatapé Challenge",
      distance: 130,
      elevation: 1700,
      description: "The big one. All the way to Guatapé and back. You'll need a support plan (or a very understanding partner with a car). The rock is optional. The suffering is not.",
      region: "Medellín",
    },
  ],
  // Recovery week — 100km, ~800m
  recovery: [
    {
      name: "Café Recovery Spin",
      distance: 100,
      elevation: 800,
      description: "100km flat-ish. Spin the legs, enjoy the view, eat an empanada at every town. You're not being lazy — you're adapting. Science says so.",
      region: "Medellín",
    },
    {
      name: "Copacabana Bakery Tour",
      distance: 95,
      elevation: 600,
      description: "North valley loop. The goal is to visit at least three bakeries. Carbs are recovery fuel. This is science. Don't question science.",
      region: "Medellín",
    },
  ],
};

export function getRouteForWeek(weekType: string, weekNum: number): RouteData {
  let pool: RouteData[];
  switch (weekType) {
    case "RECOVERY": pool = routes.recovery; break;
    case "BUILD": pool = routes.easy; break;
    case "BUILD_PLUS": pool = routes.moderate; break;
    case "OVERREACH": pool = routes.hard; break;
    default: pool = routes.easy;
  }
  return pool[weekNum % pool.length];
}
