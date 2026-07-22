import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { getCurrentDailyUsage, getRemainingDailyPapers, getCurrentPlan } from '@/lib/auth/helpers';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const plan = await getCurrentPlan(authContext.uid);
    const currentUsage = await getCurrentDailyUsage(authContext.uid);
    const remainingInfo = await getRemainingDailyPapers(authContext.uid);

    return NextResponse.json({
      success: true,
      data: {
        plan,
        dailyLimit: remainingInfo.dailyLimit,
        usedToday: currentUsage,
        remainingToday: remainingInfo.remainingToday,
        isAdmin: remainingInfo.isAdmin,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
