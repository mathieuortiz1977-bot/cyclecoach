import { auth } from "./auth";
import { prisma } from "./db";

/**
 * Get the authenticated user's rider profile.
 * Returns null if not authenticated or no rider profile exists.
 */
export async function getCurrentRider() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = (session.user as { id?: string }).id;
  if (!userId) return null;

  return prisma.rider.findUnique({
    where: { userId },
  });
}

/**
 * Get rider with Strava connection included.
 */
export async function getCurrentRiderWithStrava() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = (session.user as { id?: string }).id;
  if (!userId) return null;

  return prisma.rider.findUnique({
    where: { userId },
    include: { 
      stravaConnection: true,
      stravaActivities: {
        orderBy: { startDate: 'desc' },
        take: 100 // Limit to recent 100 activities
      }
    },
  });
}
