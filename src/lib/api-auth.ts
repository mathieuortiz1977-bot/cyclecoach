import { NextResponse } from "next/server";
import { auth } from "./auth";

/**
 * Require authentication for API routes.
 * Returns the session if authenticated, or a 401 response.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
