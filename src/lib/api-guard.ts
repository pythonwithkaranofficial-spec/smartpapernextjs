import { NextResponse } from 'next/server';
import { verifyAuthToken, AuthenticatedRequestContext } from './auth/middleware';
import { DAILY_PAPER_LIMITS, getCurrentUser, isAdminUser } from './auth/helpers';
import { UserRepository } from './db/user-repository';
import { UserSyncService } from './auth/sync-service';
import { AuthError } from './errors';

/**
 * Shared guards for the AI (Gemini) routes. These routes return `{ error: string }`
 * on failure, matching what the web and mobile clients already parse.
 */

export async function requireUser(
  req: Request
): Promise<{ ctx: AuthenticatedRequestContext } | { response: NextResponse }> {
  try {
    return { ctx: await verifyAuthToken(req) };
  } catch {
    return {
      response: NextResponse.json(
        { error: 'Please sign in to use this feature.', code: 'UNAUTHENTICATED' },
        { status: 401 }
      ),
    };
  }
}

export interface QuotaTicket {
  usedToday: number;
  dailyLimit: number;
  /** Give the generation back (call when the AI request failed). */
  refund: () => Promise<void>;
}

/**
 * Atomically consumes one paper generation from the user's daily plan quota.
 * Returns null when the quota is exhausted.
 */
export async function consumePaperQuota(
  uid: string,
  authContext?: AuthenticatedRequestContext
): Promise<QuotaTicket | null> {
  let user = await getCurrentUser(uid);

  // daily_usage has a foreign key to users: make sure the account row exists
  // (e.g. the sign-in sync failed or has not run yet) using the VERIFIED token claims.
  if (!user && authContext) {
    try {
      await UserSyncService.syncFirebaseUser({
        uid: authContext.uid,
        email: authContext.email || '',
        displayName: authContext.token.name || null,
        photoURL: authContext.token.picture || null,
        emailVerified: authContext.emailVerified || false,
        providerId: authContext.token.firebase?.sign_in_provider || 'email',
      });
    } catch (err) {
      console.error('[consumePaperQuota] could not create missing user row:', err);
      throw new AuthError(
        'Your account is not fully set up yet. Please sign out and sign in again.',
        409,
        'ACCOUNT_NOT_SYNCED'
      );
    }
    user = await getCurrentUser(uid);
  }
  const admin = isAdminUser(user);
  const plan = user?.plan || 'FREE';
  const dailyLimit = admin ? Number.MAX_SAFE_INTEGER : DAILY_PAPER_LIMITS[plan] ?? DAILY_PAPER_LIMITS.FREE;

  const used = admin
    ? await UserRepository.incrementDailyUsage(uid)
    : await UserRepository.tryConsumeDailyUsage(uid, dailyLimit);

  if (used === null) return null;

  let refunded = false;
  return {
    usedToday: used,
    dailyLimit,
    refund: async () => {
      if (refunded) return;
      refunded = true;
      try {
        await UserRepository.refundDailyUsage(uid);
      } catch (err) {
        console.error('[consumePaperQuota] refund failed:', err);
      }
    },
  };
}

export function quotaExceededResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Daily paper limit reached for your plan. Upgrade your plan or try again tomorrow.',
      code: 'LIMIT_EXCEEDED',
    },
    { status: 429 }
  );
}

/**
 * Per-user sliding-window limiter for auxiliary AI calls (swap, normalize, answer key).
 * In-memory per server instance: it is a burst/abuse brake on top of mandatory sign-in,
 * not a billing quota.
 */
const buckets = new Map<string, number[]>();

export function isUserThrottled(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= maxRequests) {
    buckets.set(key, recent);
    return true;
  }
  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (!times.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return false;
}

export function throttledResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please wait a few minutes and try again.', code: 'RATE_LIMITED' },
    { status: 429 }
  );
}
