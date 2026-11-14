import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { getRemainingDailyPapers } from '@/lib/auth/helpers';
import { handleApiError } from '@/lib/errors';

/**
 * DEPRECATED: usage is now consumed atomically on the server inside /api/generate.
 * Kept as a read-only endpoint so older app versions that still call it do not
 * double-count or break. It never changes the counter.
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const remainingInfo = await getRemainingDailyPapers(authContext.uid);

    return NextResponse.json({
      success: true,
      data: {
        usedToday: remainingInfo.usedToday,
        remainingToday: remainingInfo.remainingToday,
        isAdmin: remainingInfo.isAdmin,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
