import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// GET: Fetch rider profile
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });

  const rider = await prisma.rider.findUnique({ where: { userId } });

  if (!rider) {
    return NextResponse.json({ rider: null });
  }

  return NextResponse.json({ rider });
}

// PUT: Update rider profile (or create if missing)
export async function PUT(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = (session!.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });

  try {
    const body = await request.json();
    const { ftp, weight, experience, coachTone, maxHr, restingHr, lthr, name } = body;

    const rider = await prisma.rider.upsert({
      where: { userId },
      update: {
        ...(ftp !== undefined && { ftp }),
        ...(weight !== undefined && { weight }),
        ...(experience !== undefined && { experience }),
        ...(coachTone !== undefined && { coachTone }),
        ...(maxHr !== undefined && { maxHr }),
        ...(restingHr !== undefined && { restingHr }),
        ...(lthr !== undefined && { lthr }),
        ...(name !== undefined && { name }),
      },
      create: {
        userId,
        name: name || session!.user?.name || "Rider",
        ftp: ftp || 200,
        weight: weight || 75,
        experience: experience || "INTERMEDIATE",
        coachTone: coachTone || "MIXED",
        maxHr,
        restingHr,
        lthr,
      },
    });

    return NextResponse.json({ rider });
  } catch (err) {
    console.error("Rider update error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
