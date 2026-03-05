# 🚴 CycleCoach

**AI-powered cycling training plans with personality.**

Adaptive 16-week periodized training with dark humor coach commentary, Strava/TrainingPeaks integration, and Claude-powered dynamic coaching.

## Features

- **80 structured workouts** across 4 training blocks (Base → Threshold → VO2max → Race Sim)
- **Adaptive engine** — plan adjusts based on completed workout performance
- **AI Coach** — Claude-powered dynamic commentary, post-ride analysis, weekly recaps
- **Power zones** — all targets as % of FTP, auto-calculated
- **HR zones** — 3 calculation methods (% Max, Karvonen, LTHR)
- **Strava integration** — OAuth + ride sync + TSS calculation
- **TrainingPeaks** — CTL/ATL/TSB fitness metrics
- **Interval timer** — real-time workout player with audio cues
- **Export** — Zwift (.zwo), Wahoo (.erg), Golden Cheetah (.mrc), JSON
- **Route suggestions** — Medellín cycling routes with elevation profiles
- **Mobile responsive** — works on phone mounted to handlebars
- **Dark theme** — because cycling apps are always dark

## Quick Start

```bash
# Clone and install
git clone <your-repo>
cd cyclecoach
npm install

# Set up database
cp .env.example .env
npx prisma db push

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all available options. The app works without any API keys — optional integrations:

| Variable | Required | Purpose |
|----------|----------|---------|
| `AUTH_SECRET` | Yes (prod) | NextAuth.js session encryption |
| `STRAVA_CLIENT_ID/SECRET` | No | Strava ride sync |
| `TP_CLIENT_ID/SECRET` | No | TrainingPeaks metrics |
| `ANTHROPIC_API_KEY` | No | AI Coach (Claude) |
| `GOOGLE_CLIENT_ID/SECRET` | No | Google sign-in |

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Prisma** (SQLite dev / PostgreSQL prod)
- **NextAuth.js** (Google + Credentials)
- **Recharts** (fitness charts)
- **Vercel AI SDK** + Claude (AI coaching)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/cyclecoach)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Set `DATABASE_URL` to a PostgreSQL connection string (Vercel Postgres, Neon, or Supabase)
5. Deploy

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (strava, trainingpeaks, AI, auth, adapt)
│   ├── auth/         # Login, register, onboarding
│   ├── dashboard/    # Main dashboard
│   ├── plan/         # 16-week plan view
│   ├── settings/     # Profile, zones, connections
│   └── workout/      # Workout detail + timer
├── components/       # React components (11 total)
├── lib/              # Core logic
│   ├── adaptation.ts # Adaptive training engine
│   ├── ai-coach.ts   # Claude prompt builder
│   ├── coach.ts      # Static commentary (60+ lines)
│   ├── export.ts     # .zwo/.erg/.mrc export
│   ├── fitness.ts    # CTL/ATL/TSB calculator
│   ├── hr-zones.ts   # Heart rate zone models
│   ├── periodization.ts # Plan generator (80 sessions)
│   ├── routes.ts     # Medellín route database
│   ├── strava.ts     # Strava API client
│   ├── trainingpeaks.ts # TP API client
│   └── zones.ts      # Power zone calculator
└── prisma/           # Database schema
```

## Training Philosophy

- **4-week blocks** rotating through Base → Threshold → VO2max → Race Sim
- **5 sessions/week**: Mon/Tue/Thu/Fri indoor + Saturday 100km+ outdoor
- **Progressive overload**: Build → Build+ → Overreach → Recovery
- **Every interval has purpose** + coach commentary with dark humor
- **Adaptive**: plan adjusts based on your actual performance

---

*Built with CycleCoach. Powered by suffering and structured intervals.* 🚴
