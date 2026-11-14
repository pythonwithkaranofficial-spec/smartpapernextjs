import { UserRepository } from '../db/user-repository';
import { DatabaseUser } from '@/types/db';
import { UserRole, UserPlan } from '@/types/auth';

import { isTrustedSuperAdmin } from './super-admin';

export { SUPER_ADMIN_EMAILS, isSuperAdminEmail, isTrustedSuperAdmin } from './super-admin';

export const DAILY_PAPER_LIMITS: Record<UserPlan, number> = {
  FREE: 5,
  PRO: 999999, // 1-Day Pass: Unlimited papers per day until quota resets
  PREMIUM: 50, // 1-Year Plan: 50 papers per day for a year
  ENTERPRISE: 500,
};

/** How long each paid plan lasts after a successful payment. */
export const PLAN_DURATION_DAYS: Record<UserPlan, number | null> = {
  FREE: null,
  PRO: 1, // 1-Day Pass
  PREMIUM: 365, // 1-Year Educator Plan
  ENTERPRISE: 365,
};

/** Price of each plan in INR (single source of truth for checkout + verification). */
export const PLAN_PRICES_INR: Record<UserPlan, number> = {
  FREE: 0,
  PRO: 21,
  PREMIUM: 399,
  ENTERPRISE: 999,
};

export function computePlanExpiry(plan: UserPlan, from: Date = new Date()): string | null {
  const days = PLAN_DURATION_DAYS[plan];
  if (!days) return null;
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

/** True when the user's role (or verified super-admin email) grants admin rights. */
export function isAdminUser(user: DatabaseUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || isTrustedSuperAdmin(user.email, user.email_verified);
}

/**
 * Get full user record from Turso DB by Firebase UID
 */
export async function getCurrentUser(firebaseUid: string): Promise<DatabaseUser | null> {
  const user = await UserRepository.findUserByFirebaseUid(firebaseUid);
  // Downgrade expired time-limited plans on read.
  if (user && user.plan !== 'FREE' && user.plan_expires_at && new Date(user.plan_expires_at).getTime() <= Date.now()) {
    await UserRepository.updatePlan(firebaseUid, 'FREE');
    return { ...user, plan: 'FREE', plan_expires_at: null };
  }
  return user;
}

/**
 * Get active subscription plan for user
 */
export async function getCurrentPlan(firebaseUid: string): Promise<UserPlan> {
  const user = await getCurrentUser(firebaseUid);
  return user?.plan || 'FREE';
}

/**
 * Get user role (USER or ADMIN)
 */
export async function getCurrentRole(firebaseUid: string): Promise<UserRole> {
  const user = await getCurrentUser(firebaseUid);
  return isAdminUser(user) ? 'ADMIN' : 'USER';
}

/**
 * Get daily paper generation usage for user
 */
export async function getCurrentDailyUsage(firebaseUid: string, date?: string): Promise<number> {
  const usage = await UserRepository.getDailyUsage(firebaseUid, date);
  return typeof usage === 'number' ? usage : ((usage as unknown as { papers_generated: number })?.papers_generated || 0);
}

/**
 * Calculate remaining daily paper generations allowed for user.
 * Super-Admins and Admins (role === 'ADMIN') automatically bypass all limits with Unlimited quota.
 */
export async function getRemainingDailyPapers(firebaseUid: string): Promise<{
  plan: UserPlan;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  isAdmin: boolean;
}> {
  const user = await getCurrentUser(firebaseUid);
  const role = isAdminUser(user) ? 'ADMIN' : 'USER';
  const plan = user?.plan || 'FREE';
  const usedToday = await getCurrentDailyUsage(firebaseUid);

  // ADMIN / SUPER-ADMIN BYPASS: Unlimited daily quota
  if (role === 'ADMIN') {
    return {
      plan,
      dailyLimit: 999999,
      usedToday,
      remainingToday: 999999,
      isAdmin: true,
    };
  }

  const dailyLimit = DAILY_PAPER_LIMITS[plan] || 5;
  const remainingToday = Math.max(0, dailyLimit - usedToday);

  return {
    plan,
    dailyLimit,
    usedToday,
    remainingToday,
    isAdmin: false,
  };
}

/**
 * Check if user is a paid subscriber (PRO, PREMIUM, or ENTERPRISE) or ADMIN
 */
export async function isPremium(firebaseUid: string): Promise<boolean> {
  const user = await getCurrentUser(firebaseUid);
  if (isAdminUser(user)) return true;
  return (user?.plan || 'FREE') !== 'FREE';
}

/**
 * Check if user has administrator privileges
 */
export async function isAdmin(firebaseUid: string): Promise<boolean> {
  return isAdminUser(await getCurrentUser(firebaseUid));
}
