import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { getCurrentRider } from "@/lib/get-rider";

/**
 * GET /api/plan/verify
 * 
 * Verification endpoint to check the plan structure and data integrity
 * Returns detailed information about the current plan
 */
export async function GET(request: NextRequest) {
  console.log('🔍 [PLAN VERIFY] Starting plan verification...');
  
  const { error } = await requireAuth();
  if (error) {
    console.error('❌ [PLAN VERIFY] Auth failed');
    return error;
  }

  const rider = await getCurrentRider();
  if (!rider) {
    console.error('❌ [PLAN VERIFY] No rider profile found');
    return NextResponse.json({ error: "No rider profile" }, { status: 400 });
  }

  console.log('✅ [PLAN VERIFY] Rider found:', { riderId: rider.id });

  try {
    // Fetch the full plan
    const plan = await prisma.plan.findFirst({
      where: { riderId: rider.id },
      include: {
        blocks: {
          orderBy: { blockNumber: "asc" },
          include: {
            weeks: {
              orderBy: { weekNumber: "asc" },
              include: {
                sessions: {
                  include: {
                    intervals: { orderBy: { orderNum: "asc" } },
                    route: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      console.log('ℹ️  [PLAN VERIFY] No plan found');
      return NextResponse.json({ 
        status: "no_plan",
        message: "No plan exists for this rider",
        riderId: rider.id,
      });
    }

    // Calculate statistics
    const stats = {
      planId: plan.id,
      riderId: plan.riderId,
      
      blocks: plan.blocks.length,
      weeks: plan.blocks.reduce((s: number, b: any) => s + b.weeks.length, 0),
      sessions: plan.blocks.reduce((s: number, b: any) => s + b.weeks.reduce((ws: number, w: any) => ws + w.sessions.length, 0), 0),
      intervals: plan.blocks.reduce((s: number, b: any) => s + b.weeks.reduce((ws: number, w: any) => ws + w.sessions.reduce((ss: number, s: any) => ss + s.intervals.length, 0), 0), 0),
      
      blockDetails: plan.blocks.map((b: any) => ({
        blockNumber: b.blockNumber,
        type: b.type,
        weeks: b.weeks.length,
        sessions: b.weeks.reduce((s: number, w: any) => s + w.sessions.length, 0),
        intervals: b.weeks.reduce((s: number, w: any) => s + w.sessions.reduce((ss: number, s: any) => ss + s.intervals.length, 0), 0),
        
        weekDetails: b.weeks.map((w: any) => ({
          weekNumber: w.weekNumber,
          weekType: w.weekType,
          sessions: w.sessions.length,
          intervals: w.sessions.reduce((s: number, sess: any) => s + sess.intervals.length, 0),
          
          sessionDetails: w.sessions.map((s: any) => ({
            dayOfWeek: s.dayOfWeek,
            title: s.title,
            duration: s.duration,
            sessionType: s.sessionType,
            intervals: s.intervals.length,
          })),
        })),
      })),
    };

    console.log('✅ [PLAN VERIFY] Plan verification complete:');
    console.log('📊 Statistics:', stats);

    return NextResponse.json({
      status: "ok",
      data: plan,
      stats,
    });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ [PLAN VERIFY] Error:', errorMsg);
    
    return NextResponse.json({
      status: "error",
      error: errorMsg,
    }, { status: 500 });
  }
}
