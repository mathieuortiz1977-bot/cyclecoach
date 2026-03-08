import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentRiderWithStrava } from "@/lib/get-rider";

export async function GET() {
  try {
    const rider = await getCurrentRiderWithStrava();

    if (!rider) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get min and max years from activities
    const activities = await prisma.stravaActivity.findMany({
      where: { riderId: rider.id },
      select: { startDate: true },
      orderBy: { startDate: "asc" },
    });

    if (activities.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: "No activities yet"
      });
    }

    const years = activities.map(a => new Date(a.startDate).getFullYear());
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return NextResponse.json({
      success: true,
      hasData: true,
      min: minYear,
      max: maxYear,
      message: `You have data from ${minYear} to ${maxYear}`
    });
  } catch (err) {
    console.error("Year range error:", err);
    return NextResponse.json({ error: "Failed to get year range" }, { status: 500 });
  }
}
