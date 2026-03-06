import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { parseFitFile } from "@/lib/fit-parser";

// POST: Upload and parse a .fit file (from Zwift, Garmin, Wahoo, etc.)
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".fit")) {
      return NextResponse.json({ error: "Only .fit files are supported" }, { status: 400 });
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const summary = await parseFitFile(buffer);

    return NextResponse.json({
      success: true,
      ride: summary,
      message: `Parsed ${file.name}: ${Math.round(summary.movingTime / 60)} min, ${summary.avgPower ? summary.avgPower + "W avg" : "no power data"}`,
    });
  } catch (err) {
    console.error("FIT import error:", err);
    return NextResponse.json({ error: "Failed to parse .fit file" }, { status: 500 });
  }
}
