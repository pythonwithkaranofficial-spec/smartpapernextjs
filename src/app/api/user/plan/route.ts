import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { UserPlan } from '@/types/auth';
import { handleApiError, ValidationError } from '@/lib/errors';

const VALID_PLANS: UserPlan[] = ['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE'];

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json();

    if (!body.plan || !VALID_PLANS.includes(body.plan)) {
      throw new ValidationError(`Invalid plan provided. Must be one of: ${VALID_PLANS.join(', ')}`);
    }

    await UserRepository.updatePlan(authContext.uid, body.plan as UserPlan);
    const updatedUser = await UserRepository.findUserByFirebaseUid(authContext.uid);

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
