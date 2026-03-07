import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

interface WorkoutModification {
  id: string;
  plannedSession?: {
    title: string;
    duration: number;
    targetPower: number;
    sessionType: string;
  };
}

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
    const { schedule } = await request.json();

    if (!schedule || !Array.isArray(schedule)) {
      return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
    }

    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Since we're dealing with planned sessions (generated dynamically), 
    // we'll store the modifications as workout modifications
    const modifications = [];

    for (const workout of schedule) {
      if (workout.plannedSession) {
        // Store the workout modification
        const modification = await prisma.workoutModification.create({
          data: {
            workoutId: workout.id,
            riderId: rider.id,
            originalTitle: workout.plannedSession.title,
            modifiedTitle: workout.plannedSession.title,
            originalDuration: workout.plannedSession.duration,
            modifiedDuration: workout.plannedSession.duration,
            originalTargetPower: workout.plannedSession.targetPower,
            modifiedTargetPower: workout.plannedSession.targetPower,
            sessionType: workout.plannedSession.sessionType,
            modifiedAt: new Date(),
          },
        });

        modifications.push(modification);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Workout schedule updated successfully",
      modifications: modifications.length
    });

  } catch (error) {
    console.error("Workout reschedule error:", error);
    return NextResponse.json({ error: "Failed to apply reschedule" }, { status: 500 });
  }
}