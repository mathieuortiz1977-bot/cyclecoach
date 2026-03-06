import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {};

  // Only report presence, never leak values
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "set" : "MISSING";

  // Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch (err: unknown) {
    checks.database = "FAILED";
  }

  return NextResponse.json(checks);
}
