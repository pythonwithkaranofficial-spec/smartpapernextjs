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
      // Email ALWAYS comes from the verified token, never from the request body.
      email: authContext.email || '',
      displayName: (typeof body.displayName === 'string' ? body.displayName.slice(0, 120) : null) || authContext.token.name || null,
      photoURL: (typeof body.photoURL === 'string' && body.photoURL.length <= 400_000 ? body.photoURL : null) || authContext.token.picture || null,
      emailVerified: authContext.emailVerified || false,
      providerId: authContext.token.firebase?.sign_in_provider || 'email',
    });

    return NextResponse.json({
      success: true,
      data: syncedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
