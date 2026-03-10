import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { getCurrentRider } from "@/lib/get-rider";
import { generatePlan, type DayOfWeek } from "@/lib/periodization";

// GET: Fetch or generate plan for the current rider
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const rider = await getCurrentRider();
  if (!rider) return NextResponse.json({ error: "No rider profile" }, { status: 400 });

  // Check for existing plan
  const existingPlan = await prisma.plan.findFirst({
    where: { riderId: rider.id },
    include: {
      blocks: {
        orderBy: { blockNumber: "asc" },
        include: {
          weeks: {
            orderBy: { weekNumber: "asc" },
            include: {
              sessions: {
                include: {
                  intervals: { orderBy: { orderNum: "asc" } },
                  route: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (existingPlan) {
    return NextResponse.json({ plan: existingPlan, source: "database" });
  }

  // No plan exists — return null (client will generate + persist)
  return NextResponse.json({ plan: null, source: "none" });
}

// POST: Generate and persist a new plan
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const rider = await getCurrentRider();
  if (!rider) return NextResponse.json({ error: "No rider profile" }, { status: 400 });

  try {
    const body = await request.json().catch(() => ({}));
    const numBlocks = body.blocks || 4;
    const confirmUpdate = body.confirmUpdate || false; // User must explicitly confirm to update pending sessions
    const targetDurationMinutes = body.targetDurationMinutes || undefined; // User's requested session duration (default for all days)
    let targetSundayDurationMinutes = body.targetSundayDurationMinutes || (rider.sundayDuration as any) || undefined; // OPTIONAL: Different duration for Sunday
    
    // BUG #2 FIX: Validate Sunday duration (align with weekday validation)
    if (targetSundayDurationMinutes !== undefined && targetSundayDurationMinutes < 30) {
      console.warn(`[API] Sunday duration ${targetSundayDurationMinutes}min is too short, using 60min default`);
      targetSundayDurationMinutes = 60;
    }

    // Get rider's training schedule  
    const trainingDays: DayOfWeek[] = rider.trainingDays ? 
      rider.trainingDays.split(',').map(day => day.trim()).filter(day => 
        ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].includes(day)
      ) as DayOfWeek[] : 
      ["MON", "TUE", "THU", "FRI", "SAT"];
    const outdoorDay: DayOfWeek = (rider.outdoorDay && ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].includes(rider.outdoorDay)) ? 
      rider.outdoorDay as DayOfWeek : 
      "SAT";

    // STEP 1: Query completed AND pending workouts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: {
        riderId: rider.id,
        completed: true,
      },
      select: {
        id: true,
        date: true,
        sessionTitle: true,
        completed: true,
      },
    });

    const pendingWorkouts = await prisma.completedWorkout.findMany({
      where: {
        riderId: rider.id,
        completed: false,
        date: { gte: today }, // Future or today
      },
      select: {
        id: true,
        date: true,
        sessionTitle: true,
      },
    });

    console.log(`[Plan Update] Completed: ${completedWorkouts.length} | Pending: ${pendingWorkouts.length}`);
    
    // STEP 2: If there are pending sessions, require explicit confirmation
    if (pendingWorkouts.length > 0 && !confirmUpdate) {
      return NextResponse.json({
        error: "Pending sessions exist",
        message: `You have ${pendingWorkouts.length} pending workouts. Updating will change these sessions. Confirm to proceed.`,
        pendingCount: pendingWorkouts.length,
        requiresConfirmation: true,
      }, { status: 409 }); // Conflict - needs user confirmation
    }
    
    // Map completed workouts by date for preservation
    const completedByDate = new Map(completedWorkouts.map(w => [
      w.date.toISOString().split('T')[0], // YYYY-MM-DD key
      w
    ]));

    // STEP 3: Delete existing plan ONLY IF confirmed or no pending sessions
    // This ensures we don't accidentally delete future sessions without user confirmation
    const existingPlans = await prisma.plan.findMany({ where: { riderId: rider.id }, select: { id: true } });
    for (const p of existingPlans) {
      // Cascade delete blocks → weeks → sessions → intervals
      // NOTE: CompletedWorkout records are NOT deleted - they persist independently
      const blocks = await prisma.block.findMany({ where: { planId: p.id }, select: { id: true } });
      for (const b of blocks) {
        const weeks = await prisma.week.findMany({ where: { blockId: b.id }, select: { id: true } });
        for (const w of weeks) {
          const sessions = await prisma.trainingSession.findMany({ where: { weekId: w.id }, select: { id: true } });
          for (const s of sessions) {
            await prisma.interval.deleteMany({ where: { sessionId: s.id } });
          }
          await prisma.trainingSession.deleteMany({ where: { weekId: w.id } });
        }
        await prisma.week.deleteMany({ where: { blockId: b.id } });
      }
      await prisma.block.deleteMany({ where: { planId: p.id } });
      await prisma.plan.delete({ where: { id: p.id } });
    }
    
    console.log(`[Plan Update] CONFIRMED - Deleted old plan, regenerating with new parameters`);

    // Generate plan with custom training schedule and target duration
    console.log('[Plan Generation] Starting with params:', {
      numBlocks,
      trainingDays,
      outdoorDay,
      targetDurationMinutes,
      targetSundayDurationMinutes,
    });

    let planData;
    try {
      planData = generatePlan(
        numBlocks,
        trainingDays,
        outdoorDay,
        undefined, // season
        undefined, // raceType
        undefined, // useAINames
        rider.id,  // riderId for per-user variation
        true,      // includeInitialFTPTest
        targetDurationMinutes, // User's requested duration (default for all days)
        targetSundayDurationMinutes, // OPTIONAL: Different duration for Sunday
        50 // targetFridayDurationMinutes
      );
      console.log('[Plan Generation] Success - generated', planData.blocks.length, 'blocks');
    } catch (generateErr) {
      console.error('[Plan Generation] FAILED:', generateErr);
      throw new Error(`Plan generation failed: ${generateErr instanceof Error ? generateErr.message : String(generateErr)}`);
    }

    // Persist to DB
    const plan = await prisma.plan.create({
      data: {
        riderId: rider.id,
        blocks: {
          create: planData.blocks.map((block) => ({
            blockNumber: block.blockNumber,
            type: block.type,
            weeks: {
              create: block.weeks.map((week) => ({
                weekNumber: week.weekNumber,
                weekType: week.weekType,
                sessions: {
                  create: week.sessions.map((session) => ({
                    dayOfWeek: session.dayOfWeek,
                    sessionType: session.sessionType,
                    duration: session.duration,
                    title: session.title,
                    description: session.description,
                    intervals: {
                      create: session.intervals.map((interval, idx) => ({
                        orderNum: idx,
                        name: interval.name,
                        durationSecs: interval.durationSecs,
                        powerLow: interval.powerLow,
                        powerHigh: interval.powerHigh,
                        cadenceLow: interval.cadenceLow || null,
                        cadenceHigh: interval.cadenceHigh || null,
                        rpe: interval.rpe || null,
                        zone: interval.zone,
                        purpose: interval.purpose,
                        coachNote: interval.coachNote,
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        blocks: {
          include: {
            weeks: {
              include: {
                sessions: {
                  include: { intervals: true, route: true },
                },
              },
            },
          },
        },
      },
    });

    // SUMMARY: Completed workouts preserved, new plan generated
    console.log(`[Plan Update] ✅ COMPLETE`);
    console.log(`  - Completed: ${completedWorkouts.length} preserved (not changed)`);
    console.log(`  - Pending: ${pendingWorkouts.length} regenerated (updated)`);
    console.log(`  - Action: Plan fully regenerated with new parameters`);

    return NextResponse.json({
      plan,
      source: "generated",
      updateSummary: {
        completedPreserved: completedWorkouts.length,
        pendingUpdated: pendingWorkouts.length,
        status: "Plan regenerated successfully. Completed workouts preserved, pending sessions updated."
      }
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Plan generation error:", errorMsg);
    console.error("Full error:", err);
    return NextResponse.json({ 
      error: "Failed to generate plan",
      details: errorMsg 
    }, { status: 500 });
  }
}
