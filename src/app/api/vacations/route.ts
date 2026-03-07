import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
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
      where: { userId },
      include: {
        vacations: {
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      vacations: rider.vacations.map(v => ({
        id: v.id,
        startDate: v.startDate.toISOString(),
        endDate: v.endDate.toISOString(),
        type: v.type,
        description: v.description,
        location: v.location,
        isActive: v.isActive,
        isApplied: v.isApplied,
        expectedFitnessLoss: v.expectedFitnessLoss,
        recoveryTime: v.recoveryTime,
      }))
    });

  } catch (error) {
    console.error("Vacation fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch vacations" }, { status: 500 });
  }
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
    const { 
      startDate, 
      endDate, 
      type, 
      description, 
      location, 
      analysisResults 
    } = await request.json();

    if (!startDate || !endDate || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Check for overlapping vacations
    const overlapping = await prisma.vacation.findFirst({
      where: {
        riderId: rider.id,
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } }
            ]
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return NextResponse.json({ error: "Vacation dates overlap with existing vacation" }, { status: 400 });
    }

    // Create the vacation
    const vacation = await prisma.vacation.create({
      data: {
        riderId: rider.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        description,
        location,
        expectedFitnessLoss: analysisResults?.impact?.fitnessLoss,
        detrainingLevel: analysisResults?.impact?.detrainingLevel,
        recoveryTime: analysisResults?.impact?.recoveryTime,
        programExtensionWeeks: analysisResults?.programAdjustments?.programExtension ? 
          parseInt(analysisResults.programAdjustments.programExtension.split(' ')[0]) || null : null,
        preVacationPlan: analysisResults?.programAdjustments ? 
          JSON.stringify(analysisResults.programAdjustments) : null,
        postVacationPlan: analysisResults?.maintenanceStrategy ? 
          JSON.stringify(analysisResults.maintenanceStrategy) : null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      vacation: {
        id: vacation.id,
        startDate: vacation.startDate.toISOString(),
        endDate: vacation.endDate.toISOString(),
        type: vacation.type,
        description: vacation.description,
        location: vacation.location,
      }
    });

  } catch (error) {
    console.error("Vacation creation error:", error);
    return NextResponse.json({ error: "Failed to create vacation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "No user id" }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const vacationId = searchParams.get('id');

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

    // Delete the vacation (ensure it belongs to this rider)
    await prisma.vacation.deleteMany({
      where: {
        id: vacationId,
        riderId: rider.id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Vacation deletion error:", error);
    return NextResponse.json({ error: "Failed to delete vacation" }, { status: 500 });
  }
}