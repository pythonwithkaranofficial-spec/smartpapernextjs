"use client";

const LIMIT = 5;

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `paper_gen_${year}-${month}-${day}`;
}

export const clientRateLimiter = {
  canGenerate(): boolean {
    if (typeof window === "undefined") return true;
    const key = getTodayKey();
    const countStr = localStorage.getItem(key);
    if (!countStr) return true;
    return parseInt(countStr, 10) < LIMIT;
  },

  recordGeneration(): void {
    if (typeof window === "undefined") return;
    const key = getTodayKey();
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

  getRemainingCount(): number {
    if (typeof window === "undefined") return LIMIT;
    const key = getTodayKey();
    const countStr = localStorage.getItem(key);
    if (!countStr) return LIMIT;
    const count = parseInt(countStr, 10);
    return Math.max(0, LIMIT - count);
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
