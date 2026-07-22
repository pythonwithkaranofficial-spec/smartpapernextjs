import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const user = await UserRepository.findUserByFirebaseUid(authContext.uid);

    if (!user) {
      throw new NotFoundError('User record not found in database', 404);
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
