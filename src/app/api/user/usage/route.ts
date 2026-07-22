import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { getCurrentDailyUsage, getRemainingDailyPapers, getCurrentUser } from '@/lib/auth/helpers';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const user = await getCurrentUser(authContext.uid);
    const plan = user?.plan || 'FREE';
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
        updatedAt: user?.updated_at || new Date().toISOString(),
        createdAt: user?.created_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
