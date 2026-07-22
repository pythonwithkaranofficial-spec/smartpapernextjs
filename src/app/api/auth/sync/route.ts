import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserSyncService } from '@/lib/auth/sync-service';
import { handleApiError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json().catch(() => ({}));

    const syncedUser = await UserSyncService.syncFirebaseUser({
      uid: authContext.uid,
      email: authContext.email || body.email || '',
      displayName: body.displayName || authContext.token.name || null,
      photoURL: body.photoURL || authContext.token.picture || null,
      emailVerified: authContext.emailVerified || false,
      providerId: body.providerId || authContext.token.firebase?.sign_in_provider || 'email',
    });

    return NextResponse.json({
      success: true,
      data: syncedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
