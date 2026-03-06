import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { getCurrentRider } from "@/lib/get-rider";

// GET: List completed workouts
export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const rider = await getCurrentRider();
  if (!rider) return NextResponse.json({ workouts: [] });

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const workouts = await prisma.completedWorkout.findMany({
    where: { riderId: rider.id },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({ workouts });
}

// POST: Log a completed workout
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const rider = await getCurrentRider();
  if (!rider) return NextResponse.json({ error: "No rider profile" }, { status: 400 });

  try {
    const body = await request.json();
    const workout = await prisma.completedWorkout.create({
      data: {
        riderId: rider.id,
        sessionTitle: body.sessionTitle,
        dayOfWeek: body.dayOfWeek,
        sessionType: body.sessionType || "INDOOR",
        plannedDuration: body.plannedDuration,
        actualDuration: body.actualDuration,
        avgPower: body.avgPower,
        rpe: body.rpe,
        compliance: body.compliance,
        feelings: body.feelings || [],
        notes: body.notes,
        completed: body.completed ?? true,
        blockIdx: body.blockIdx,
        weekIdx: body.weekIdx,
        sessionIdx: body.sessionIdx,
        stravaActivityId: body.stravaActivityId,
        date: body.date ? new Date(body.date) : new Date(),
      },
    });

    return NextResponse.json({ workout });
  } catch (err) {
    console.error("Workout log error:", err);
    return NextResponse.json({ error: "Failed to log workout" }, { status: 500 });
  }
}
