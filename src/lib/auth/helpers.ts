import { UserRepository } from '../db/user-repository';
import { DatabaseUser } from '@/types/db';
import { UserRole, UserPlan } from '@/types/auth';

export const DAILY_PAPER_LIMITS: Record<UserPlan, number> = {
  FREE: 5,
  PRO: 999999, // 1-Day Pass: Unlimited papers per day until quota resets
  PREMIUM: 50, // 1-Year Plan: 50 papers per day for a year
  ENTERPRISE: 500,
};

/**
 * Get full user record from Turso DB by Firebase UID
 */
export async function getCurrentUser(firebaseUid: string): Promise<DatabaseUser | null> {
  return UserRepository.findUserByFirebaseUid(firebaseUid);
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
  return user?.role || 'USER';
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
 * Developers and Admins (role === 'ADMIN') automatically bypass all limits with Unlimited quota.
 */
export async function getRemainingDailyPapers(firebaseUid: string): Promise<{
  plan: UserPlan;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  isAdmin: boolean;
}> {
  const user = await getCurrentUser(firebaseUid);
  const role = user?.role || 'USER';
  const plan = user?.plan || 'FREE';
  const usedToday = await getCurrentDailyUsage(firebaseUid);

  // ADMIN / DEVELOPER BYPASS: Unlimited daily quota
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
  if (user?.role === 'ADMIN') return true;
  return (user?.plan || 'FREE') !== 'FREE';
}

/**
 * Check if user has administrator privileges
 */
export async function isAdmin(firebaseUid: string): Promise<boolean> {
  const role = await getCurrentRole(firebaseUid);
  return role === 'ADMIN';
}
