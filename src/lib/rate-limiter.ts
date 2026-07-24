"use client";

import { isSuperAdminEmail } from "./auth/helpers";

const LIMIT = 5;

function getTodayUserKey(email?: string | null) {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const userIdentifier = email ? email.toLowerCase().trim() : 'anonymous';
  return `paper_gen_${userIdentifier}_${year}-${month}-${day}`;
}

export const clientRateLimiter = {
  canGenerate(userEmail?: string | null, isAdmin = false): boolean {
    // Admins and Super-Admins ALWAYS have unlimited generation access
    if (isAdmin || isSuperAdminEmail(userEmail)) {
      return true;
    }

    if (typeof window === "undefined") return true;
    const key = getTodayUserKey(userEmail);
    const countStr = localStorage.getItem(key);
    if (!countStr) return true;
    return parseInt(countStr, 10) < LIMIT;
  },

  recordGeneration(userEmail?: string | null, isAdmin = false): void {
    if (typeof window === "undefined" || isAdmin || isSuperAdminEmail(userEmail)) return;
    const key = getTodayUserKey(userEmail);
    const countStr = localStorage.getItem(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    localStorage.setItem(key, String(count + 1));
    
    // Clean up old keys
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith("paper_gen_") && k !== key) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.error("Failed to clean up localStorage", e);
    }
  },

  getRemainingCount(userEmail?: string | null, isAdmin = false): number {
    if (isAdmin || isSuperAdminEmail(userEmail)) {
      return 999999;
    }

    if (typeof window === "undefined") return LIMIT;
    const key = getTodayUserKey(userEmail);
    const countStr = localStorage.getItem(key);
    if (!countStr) return LIMIT;
    const count = parseInt(countStr, 10);
    return Math.max(0, LIMIT - count);
  },

  getUsedCount(userEmail?: string | null): number {
    if (typeof window === "undefined") return 0;
    const key = getTodayUserKey(userEmail);
    const countStr = localStorage.getItem(key);
    if (!countStr) return 0;
    return parseInt(countStr, 10) || 0;
  },

  getResetTime(): string {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = midnight.getTime() - now.getTime();
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  }
};
