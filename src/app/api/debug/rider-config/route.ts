/**
 * DEBUG ENDPOINT: Show exactly what's in the database for the rider
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });

  try {
    const rider = await prisma.rider.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        trainingDays: true,
        sundayDuration: true,
        outdoorDay: true,
        ftp: true,
      },
    });

    if (!rider) {
      return NextResponse.json({ error: "No rider found", userId }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rider,
      debug: {
        trainingDaysType: typeof rider.trainingDays,
        trainingDaysValue: rider.trainingDays,
        trainingDaysSplit: rider.trainingDays ? rider.trainingDays.split(',') : null,
        sundayDurationValue: rider.sundayDuration,
        outdoorDayValue: rider.outdoorDay,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
