import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { handleApiError, ValidationError } from '@/lib/errors';

/**
 * Self-service plan change. Users may only DOWNGRADE to FREE here.
 * Paid plans are granted exclusively by /api/payment/verify after a verified Razorpay payment
 * (or by an admin via /api/admin/users).
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json().catch(() => ({}));

    if (body.plan !== 'FREE') {
      throw new ValidationError(
        'Paid plans can only be activated through a completed payment.',
        403,
        'PAYMENT_REQUIRED'
      );
    }

    await UserRepository.updatePlan(authContext.uid, 'FREE');
    const updatedUser = await UserRepository.findUserByFirebaseUid(authContext.uid);

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
