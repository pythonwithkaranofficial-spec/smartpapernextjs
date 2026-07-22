import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { getCurrentDailyUsage, getRemainingDailyPapers, getCurrentPlan, DAILY_PAPER_LIMITS } from '@/lib/auth/helpers';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const plan = await getCurrentPlan(authContext.uid);
    const currentUsage = await getCurrentDailyUsage(authContext.uid);
    const remaining = await getRemainingDailyPapers(authContext.uid);
    const dailyLimit = DAILY_PAPER_LIMITS[plan] ?? DAILY_PAPER_LIMITS.FREE;

    return NextResponse.json({
      success: true,
      data: {
        plan,
        dailyLimit,
        usedToday: currentUsage,
        remainingToday: remaining,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
