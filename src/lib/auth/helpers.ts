import { UserRepository } from '../db/user-repository';
import { DatabaseUser } from '../../types/db';
import { UserPlan, UserRole } from '../../types/auth';

export const DAILY_PAPER_LIMITS: Record<UserPlan, number> = {
  FREE: 3,
  PRO: 50,
  PREMIUM: 100,
  ENTERPRISE: 9999,
};

/**
 * Get user record from database by Firebase UID
 */
export async function getCurrentUser(firebaseUid: string): Promise<DatabaseUser | null> {
  return UserRepository.findUserByFirebaseUid(firebaseUid);
}

/**
 * Get current plan for user from database
 */
export async function getCurrentPlan(firebaseUid: string): Promise<UserPlan> {
  const user = await UserRepository.findUserByFirebaseUid(firebaseUid);
  return user ? user.plan : 'FREE';
}

/**
 * Get current role for user from database
 */
export async function getCurrentRole(firebaseUid: string): Promise<UserRole> {
  const user = await UserRepository.findUserByFirebaseUid(firebaseUid);
  return user ? user.role : 'USER';
}

/**
 * Get daily paper generation usage for user
 */
export async function getCurrentDailyUsage(firebaseUid: string, date?: string): Promise<number> {
  const usage = await UserRepository.getDailyUsage(firebaseUid, date);
  return usage.papers_generated;
}

/**
 * Calculate remaining daily paper generations allowed for user
 */
export async function getRemainingDailyPapers(firebaseUid: string, date?: string): Promise<number> {
  const plan = await getCurrentPlan(firebaseUid);
  const limit = DAILY_PAPER_LIMITS[plan] ?? DAILY_PAPER_LIMITS.FREE;
  const currentUsage = await getCurrentDailyUsage(firebaseUid, date);
  
  const remaining = limit - currentUsage;
  return remaining > 0 ? remaining : 0;
}

/**
 * Check if user has an active premium/paid plan
 */
export async function isPremium(firebaseUid: string): Promise<boolean> {
  const plan = await getCurrentPlan(firebaseUid);
  return plan === 'PRO' || plan === 'PREMIUM' || plan === 'ENTERPRISE';
}

/**
 * Check if user has ADMIN role
 */
export async function isAdmin(firebaseUid: string): Promise<boolean> {
  const role = await getCurrentRole(firebaseUid);
  return role === 'ADMIN';
}
