import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { getRemainingDailyPapers } from '@/lib/auth/helpers';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const remainingInfo = await getRemainingDailyPapers(authContext.uid);

    if (remainingInfo.remainingToday <= 0) {
      throw new ValidationError('Daily paper generation limit reached for your current plan', 403, 'LIMIT_EXCEEDED');
    }

    const updatedCount = await UserRepository.incrementDailyUsage(authContext.uid);

    return NextResponse.json({
      success: true,
      data: {
        usedToday: updatedCount,
        remainingToday: Math.max(0, remainingInfo.remainingToday - 1),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
