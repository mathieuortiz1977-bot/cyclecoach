import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Resolve DATABASE_URL from multiple possible env var names (Vercel/Neon)
if (!process.env.DATABASE_URL) {
  const fallback = process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL
    || process.env.STORAGE_URL;
  if (fallback) {
    process.env.DATABASE_URL = fallback;
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
