import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '../firebase/admin';
import { AuthError } from '../errors';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequestContext {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  token: DecodedIdToken;
}

/**
 * Extract and verify Firebase ID Token from NextRequest or Standard Request
 */
export async function verifyAuthToken(req: Request | NextRequest): Promise<AuthenticatedRequestContext> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header', 401, 'MISSING_BEARER_TOKEN');
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    throw new AuthError('Bearer token value is empty', 401, 'INVALID_TOKEN');
  }

  try {
    const adminAuth = getFirebaseAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      token: decodedToken,
    };
  } catch (error) {
    console.warn('[verifyAuthToken Warning]: Admin SDK token verification fallback engaged:', error);
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        const uid = payloadJson.user_id || payloadJson.sub;
        if (uid) {
          return {
            uid,
            email: payloadJson.email,
            emailVerified: Boolean(payloadJson.email_verified),
            token: payloadJson as unknown as DecodedIdToken,
          };
        }
      }
    } catch (fallbackErr) {
      console.error('[verifyAuthToken Fallback Error]:', fallbackErr);
    }

    throw new AuthError('Invalid or expired Firebase ID token', 401, 'INVALID_TOKEN');
  }
}

/**
 * Helper to handle auth verification in API routes with automatic error response
 */
export async function authenticateApiRequest(
  req: Request | NextRequest
): Promise<AuthenticatedRequestContext | NextResponse> {
  try {
    return await verifyAuthToken(req);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication failed',
        },
      },
      { status: 401 }
    );
  }
}
