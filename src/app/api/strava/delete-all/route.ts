import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "No user id" }, { status: 400 });
  }

  try {
    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Delete all Strava activities for this rider
    const result = await prisma.stravaActivity.deleteMany({
      where: { riderId: rider.id }
    });

    // Also delete all segment stats for this rider
    await prisma.segmentStat.deleteMany({
      where: { riderId: rider.id }
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Deleted ${result.count} Strava rides and all segment data. You can now re-sync with correct dates.`
    });
  } catch (err) {
    console.error("Delete all rides error:", err);
    return NextResponse.json(
      { error: "Failed to delete rides", success: false },
      { status: 500 }
    );
  }
}
