import { NextResponse } from "next/server";
import { getCurrentRider } from "@/lib/get-rider";

interface FTPHistoryPoint {
  date: string;
  ftp: number;
  source: "manual" | "estimated" | "test" | "current";
}

export async function GET() {
  try {
    const rider = await getCurrentRider();

    if (!rider) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // For now, return empty array
    // In future: calculate FTP history from completed workouts with power data
    const ftpHistory: FTPHistoryPoint[] = [];

    return NextResponse.json({
      success: true,
      history: ftpHistory,
    });
  } catch (err) {
    console.error("[GET /api/rider/ftp-history] Error:", err);
    return NextResponse.json({ error: "Failed to get FTP history" }, { status: 500 });
  }
}
