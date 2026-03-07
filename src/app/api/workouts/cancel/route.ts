import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "No user id" }, { status: 400 });
  }

  try {
    const { workoutId, reason } = await request.json();

    if (!workoutId || !reason) {
      return NextResponse.json({ error: "Missing workoutId or reason" }, { status: 400 });
    }

    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // For planned sessions, we need to create a cancellation record
    // Since planned sessions are generated dynamically, we'll store cancellations separately
    const cancellation = await prisma.workoutCancellation.create({
      data: {
        workoutId,
        riderId: rider.id,
        reason,
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      cancellation: {
        id: cancellation.id,
        workoutId: cancellation.workoutId,
        reason: cancellation.reason,
        cancelledAt: cancellation.cancelledAt,
      }
    });

  } catch (error) {
    console.error("Workout cancellation error:", error);
    return NextResponse.json({ error: "Failed to cancel workout" }, { status: 500 });
  }
}