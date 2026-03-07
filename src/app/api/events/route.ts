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
        raceEvents: {
          orderBy: { date: 'asc' },
          where: { isComplete: false } // Only return upcoming events
        }
      }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      events: rider.raceEvents.map(e => ({
        id: e.id,
        name: e.name,
        date: e.date.toISOString(),
        type: e.type,
        priority: e.priority,
        location: e.location,
        distance: e.distance,
        description: e.description,
        peakDate: e.peakDate?.toISOString(),
        taperWeeks: e.taperWeeks,
        isActive: e.isActive,
        isComplete: e.isComplete,
      }))
    });

  } catch (error) {
    console.error("Race events fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch race events" }, { status: 500 });
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
      name, 
      date, 
      type, 
      priority, 
      location, 
      distance, 
      description,
      peakDate,
      taperWeeks,
      periodizationPlan 
    } = await request.json();

    if (!name || !date || !type || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId },
      include: {
        raceEvents: {
          where: { isComplete: false }
        }
      }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Check limits based on priority
    const currentCounts = {
      A: rider.raceEvents.filter(e => e.priority === "A").length,
      B: rider.raceEvents.filter(e => e.priority === "B").length,
      C: rider.raceEvents.filter(e => e.priority === "C").length
    };

    const limits = { A: 2, B: 2, C: 4 };
    
    if (currentCounts[priority as keyof typeof currentCounts] >= limits[priority as keyof typeof limits]) {
      return NextResponse.json({ 
        error: `Maximum ${limits[priority as keyof typeof limits]} ${priority}-priority events allowed` 
      }, { status: 400 });
    }

    // Check for conflicting events on same date
    const existingEvent = await prisma.raceEvent.findFirst({
      where: {
        riderId: rider.id,
        date: new Date(date),
        isComplete: false
      }
    });

    if (existingEvent) {
      return NextResponse.json({ error: "Event already exists on this date" }, { status: 400 });
    }

    // Create the race event
    const raceEvent = await prisma.raceEvent.create({
      data: {
        riderId: rider.id,
        name,
        date: new Date(date),
        type,
        priority,
        location,
        distance,
        description,
        peakDate: peakDate ? new Date(peakDate) : null,
        taperWeeks,
        periodizationPlan: periodizationPlan ? JSON.stringify(periodizationPlan) : null,
      },
    });

    // Update isActive status if this event is coming up (within 12 weeks)
    const weeksUntilEvent = Math.ceil((raceEvent.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7));
    const shouldBeActive = weeksUntilEvent <= 12 && weeksUntilEvent > 0 && priority === "A";
    
    if (shouldBeActive) {
      await prisma.raceEvent.update({
        where: { id: raceEvent.id },
        data: { isActive: true }
      });
    }

    return NextResponse.json({ 
      success: true, 
      event: {
        id: raceEvent.id,
        name: raceEvent.name,
        date: raceEvent.date.toISOString(),
        type: raceEvent.type,
        priority: raceEvent.priority,
        location: raceEvent.location,
        distance: raceEvent.distance,
        description: raceEvent.description,
        peakDate: raceEvent.peakDate?.toISOString(),
        taperWeeks: raceEvent.taperWeeks,
        isActive: shouldBeActive
      }
    });

  } catch (error) {
    console.error("Race event creation error:", error);
    return NextResponse.json({ error: "Failed to create race event" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
      id,
      name, 
      date, 
      type, 
      priority, 
      location, 
      distance, 
      description,
      isComplete 
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Update the race event (ensure it belongs to this rider)
    const updatedEvent = await prisma.raceEvent.updateMany({
      where: {
        id,
        riderId: rider.id
      },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        type,
        priority,
        location,
        distance,
        description,
        isComplete,
        updatedAt: new Date()
      }
    });

    if (updatedEvent.count === 0) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Race event update error:", error);
    return NextResponse.json({ error: "Failed to update race event" }, { status: 500 });
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
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    // Find the rider
    const rider = await prisma.rider.findUnique({
      where: { userId }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    // Delete the race event (ensure it belongs to this rider)
    await prisma.raceEvent.deleteMany({
      where: {
        id: eventId,
        riderId: rider.id
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Race event deletion error:", error);
    return NextResponse.json({ error: "Failed to delete race event" }, { status: 500 });
  }
}