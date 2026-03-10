/**
 * DEBUG ENDPOINT: Show exactly what parameters are being used for plan generation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });

  try {
    const body = await request.json().catch(() => ({}));
    
    const rider = await prisma.rider.findUnique({
      where: { userId },
      select: {
        trainingDays: true,
        outdoorDay: true,
        sundayDuration: true,
      },
    });

    if (!rider) {
      return NextResponse.json({ error: "No rider" }, { status: 404 });
    }

    // Replicate the exact logic from /api/plan
    const trainingDays = rider.trainingDays 
      ? rider.trainingDays.split(',').filter(day => 
          ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].includes(day)
        )
      : ["MON", "TUE", "THU", "FRI", "SAT"];

    const outdoorDay = (rider.outdoorDay && ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].includes(rider.outdoorDay))
      ? rider.outdoorDay
      : "SAT";

    const targetDurationMinutes = body.targetDurationMinutes || undefined;
    const targetSundayDurationMinutes = body.targetSundayDurationMinutes || (rider.sundayDuration as any) || undefined;

    return NextResponse.json({
      success: true,
      parameters: {
        trainingDays,
        trainingDaysCount: trainingDays.length,
        outdoorDay,
        targetDurationMinutes,
        targetSundayDurationMinutes,
        sundayDurationFromRider: rider.sundayDuration,
      },
      raw: {
        riderTrainingDays: rider.trainingDays,
        riderOutdoorDay: rider.outdoorDay,
        riderSundayDuration: rider.sundayDuration,
        bodyTargetDurationMinutes: body.targetDurationMinutes,
        bodyTargetSundayDurationMinutes: body.targetSundayDurationMinutes,
      },
      debug: {
        message: "These parameters will be passed to generatePlan()",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
