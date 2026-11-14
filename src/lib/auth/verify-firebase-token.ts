import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Verifies Firebase Auth ID tokens without firebase-admin.
 *
 * firebase-admin's verifier depends on jwks-rsa, which `require()`s the ESM-only `jose`
 * package and crashes on Node runtimes without require(esm) support (ERR_REQUIRE_ESM on Vercel).
 * This implements the checks documented by Firebase for third-party JWT libraries:
 * https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
 */

const FIREBASE_JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
);

// Cached across invocations of a warm serverless instance; jose handles key rotation/caching.
const firebaseJwks = createRemoteJWKSet(FIREBASE_JWKS_URL, {
  cooldownDuration: 30_000,
  cacheMaxAge: 6 * 60 * 60 * 1000,
});

export function getFirebaseProjectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'smartpapergenwebsite'
  );
}

export interface FirebaseIdTokenClaims extends JWTPayload {
  uid: string;
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  auth_time?: number;
  firebase?: {
    sign_in_provider?: string;
    identities?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function verifyFirebaseIdToken(token: string): Promise<FirebaseIdTokenClaims> {
  const projectId = getFirebaseProjectId();

  const { payload } = await jwtVerify(token, firebaseJwks, {
    algorithms: ['RS256'],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
    clockTolerance: 5,
  });

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.sub !== 'string' || payload.sub.length === 0 || payload.sub.length > 128) {
    throw new Error('Firebase ID token has an invalid "sub" claim');
  }
  if (typeof payload.iat !== 'number' || payload.iat > now + 5) {
    throw new Error('Firebase ID token has an invalid "iat" claim');
  }
  const authTime = (payload as { auth_time?: unknown }).auth_time;
  if (typeof authTime !== 'number' || authTime > now + 5) {
    throw new Error('Firebase ID token has an invalid "auth_time" claim');
  }

  return { ...(payload as FirebaseIdTokenClaims), uid: payload.sub };
}
