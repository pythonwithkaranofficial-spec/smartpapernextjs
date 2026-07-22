import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { getRemainingDailyPapers } from '@/lib/auth/helpers';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const remainingInfo = await getRemainingDailyPapers(authContext.uid);

    // If user is not an Admin and has 0 remaining papers today, block generation
    if (!remainingInfo.isAdmin && remainingInfo.remainingToday <= 0) {
      throw new ValidationError('Daily paper generation limit reached for your current plan', 403, 'LIMIT_EXCEEDED');
    }

    const updatedCount = await UserRepository.incrementDailyUsage(authContext.uid);

    return NextResponse.json({
      success: true,
      data: {
        usedToday: updatedCount,
        remainingToday: remainingInfo.isAdmin ? 999999 : Math.max(0, remainingInfo.remainingToday - 1),
        isAdmin: remainingInfo.isAdmin,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
