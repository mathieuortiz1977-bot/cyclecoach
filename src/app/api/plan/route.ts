import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { getCurrentRider } from "@/lib/get-rider";
import { generatePlan } from "@/lib/periodization";

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

    // Delete existing plan for this rider
    const existingPlans = await prisma.plan.findMany({ where: { riderId: rider.id }, select: { id: true } });
    for (const p of existingPlans) {
      // Cascade delete blocks → weeks → sessions → intervals
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

    // Generate plan
    const planData = generatePlan(numBlocks);

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

    return NextResponse.json({ plan, source: "generated" });
  } catch (err) {
    console.error("Plan generation error:", err);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
