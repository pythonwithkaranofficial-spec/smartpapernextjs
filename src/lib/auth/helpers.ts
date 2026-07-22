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
 * Calculate remaining daily paper generations allowed for user
 */
export async function getRemainingDailyPapers(firebaseUid: string): Promise<{
  plan: UserPlan;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
}> {
  const plan = await getCurrentPlan(firebaseUid);
  const usedToday = await getCurrentDailyUsage(firebaseUid);

  const dailyLimit = DAILY_PAPER_LIMITS[plan] || 5;
  const remainingToday = Math.max(0, dailyLimit - usedToday);

  return {
    plan,
    dailyLimit,
    usedToday,
    remainingToday,
  };
}

/**
 * Check if user is a paid subscriber (PRO, PREMIUM, or ENTERPRISE)
 */
export async function isPremium(firebaseUid: string): Promise<boolean> {
  const plan = await getCurrentPlan(firebaseUid);
  return plan !== 'FREE';
}

/**
 * Check if user has administrator privileges
 */
export async function isAdmin(firebaseUid: string): Promise<boolean> {
  const role = await getCurrentRole(firebaseUid);
  return role === 'ADMIN';
}
