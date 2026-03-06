import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set (" + process.env.DATABASE_URL.substring(0, 30) + "...)" : "MISSING";
  checks.POSTGRES_URL = process.env.POSTGRES_URL ? "set" : "not set";
  checks.POSTGRES_PRISMA_URL = process.env.POSTGRES_PRISMA_URL ? "set" : "not set";
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "set" : "MISSING";

  // Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch (err: any) {
    checks.database = "FAILED: " + (err?.message || "unknown");
  }

  // Check user count
  try {
    const count = await prisma.user.count();
    checks.users = String(count);
  } catch (err: any) {
    checks.users = "FAILED: " + (err?.message || "unknown");
  }

  return NextResponse.json(checks);
}
