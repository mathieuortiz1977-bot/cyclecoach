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
    const { vacationId, programAdjustments } = await request.json();

    if (!vacationId) {
      return NextResponse.json({ error: "Vacation ID required" }, { status: 400 });
    }

    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Find the vacation
    const vacation = await prisma.vacation.findFirst({
      where: {
        id: vacationId,
        riderId: rider.id
      }
    });

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    // Update vacation with applied status and adjustments
    await prisma.vacation.update({
      where: { id: vacationId },
      data: {
        isApplied: true,
        preVacationPlan: programAdjustments?.preVacation ? 
          JSON.stringify(programAdjustments.preVacation) : vacation.preVacationPlan,
        postVacationPlan: programAdjustments?.postVacation ? 
          JSON.stringify(programAdjustments.postVacation) : vacation.postVacationPlan,
        updatedAt: new Date()
      }
    });

    // Check if vacation should be active (current date is within vacation period)
    const now = new Date();
    const isCurrentlyActive = now >= vacation.startDate && now <= vacation.endDate;
    
    if (isCurrentlyActive) {
      await prisma.vacation.update({
        where: { id: vacationId },
        data: { isActive: true }
      });
    }

    // If there are specific workout modifications, apply them
    if (programAdjustments?.workoutModifications?.length > 0) {
      for (const modification of programAdjustments.workoutModifications) {
        await prisma.workoutModification.create({
          data: {
            workoutId: modification.workoutId,
            riderId: rider.id,
            originalTitle: modification.originalTitle,
            modifiedTitle: modification.modifiedTitle,
            originalDuration: modification.originalDuration,
            modifiedDuration: modification.modifiedDuration,
            originalTargetPower: modification.originalTargetPower,
            modifiedTargetPower: modification.modifiedTargetPower,
            sessionType: modification.sessionType,
          },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Vacation program adjustments applied successfully",
      isActive: isCurrentlyActive
    });

  } catch (error) {
    console.error("Vacation application error:", error);
    return NextResponse.json({ error: "Failed to apply vacation adjustments" }, { status: 500 });
  }
}