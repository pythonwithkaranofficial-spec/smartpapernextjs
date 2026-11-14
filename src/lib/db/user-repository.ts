import { executeSql, queryOne, queryRows } from '../turso';
import { DatabaseUser, PaperHistoryRecord, CreatePaperHistoryInput } from '@/types/db';
import { UserRole, UserPlan } from '@/types/auth';

let schemaEnsured: Promise<void> | null = null;

/**
 * Lazily applies additive schema migrations to existing databases (idempotent).
 * - users.plan_expires_at: expiry for time-limited paid plans (NULL = no expiry).
 */
export function ensureSchema(): Promise<void> {
  if (!schemaEnsured) {
    schemaEnsured = (async () => {
      try {
        await executeSql(`ALTER TABLE users ADD COLUMN plan_expires_at TEXT`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!/duplicate column/i.test(msg)) {
          console.warn('[ensureSchema] plan_expires_at migration skipped:', msg);
        }
      }
    })();
  }
  return schemaEnsured;
}

/** Placeholder email for accounts without one (phone/anonymous); keeps users.email UNIQUE NOT NULL satisfied. */
export function placeholderEmailFor(firebaseUid: string): string {
  return `no-email+${firebaseUid}@users.invalid`;
}

export class UserRepository {
  /**
   * Find a user record by Firebase UID
   */
  static async findUserByFirebaseUid(firebaseUid: string): Promise<DatabaseUser | null> {
    await ensureSchema();
    return queryOne<DatabaseUser>({
      sql: `SELECT * FROM users WHERE firebase_uid = ? LIMIT 1`,
      args: [firebaseUid],
    });
  }

  /**
   * Find a user record by Email Address
   */
  static async findUserByEmail(email: string): Promise<DatabaseUser | null> {
    await ensureSchema();
    return queryOne<DatabaseUser>({
      sql: `SELECT * FROM users WHERE email = ? LIMIT 1`,
      args: [email],
    });
  }

  /**
   * Insert new user record into Turso DB
   */
  static async createUser(user: Partial<DatabaseUser> & { firebase_uid: string; email: string }): Promise<DatabaseUser> {
    await ensureSchema();
    const id = user.id || crypto.randomUUID();
    const email = user.email?.trim() ? user.email.trim().toLowerCase() : placeholderEmailFor(user.firebase_uid);
    const name = user.name || null;
    const photoUrl = user.photo_url || null;
    const provider = user.provider || 'email';
    const emailVerified = user.email_verified ? 1 : 0;
    const role = user.role || 'USER';
    const plan = user.plan || 'FREE';
    const now = new Date().toISOString();

    await executeSql({
      sql: `INSERT INTO users (id, firebase_uid, name, email, photo_url, provider, email_verified, role, plan, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, user.firebase_uid, name, email, photoUrl, provider, emailVerified, role, plan, now, now],
    });

    const created = await this.findUserByFirebaseUid(user.firebase_uid);
    if (!created) {
      throw new Error('Failed to create user in database');
    }
    return created;
  }

  /**
   * Update existing user details
   */
  static async updateUser(firebaseUid: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser | null> {
    await ensureSchema();
    const fields: string[] = [];
    const args: (string | number | null)[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      args.push(updates.name);
    }
    if (updates.photo_url !== undefined) {
      fields.push('photo_url = ?');
      args.push(updates.photo_url);
    }
    if (updates.email_verified !== undefined) {
      fields.push('email_verified = ?');
      args.push(updates.email_verified ? 1 : 0);
    }
    if (updates.role !== undefined) {
      fields.push('role = ?');
      args.push(updates.role);
    }
    if (updates.plan !== undefined) {
      fields.push('plan = ?');
      args.push(updates.plan);
    }
    if (updates.plan_expires_at !== undefined) {
      fields.push('plan_expires_at = ?');
      args.push(updates.plan_expires_at);
    }
    if (updates.email !== undefined && updates.email.trim()) {
      fields.push('email = ?');
      args.push(updates.email.trim().toLowerCase());
    }

    if (fields.length === 0) {
      return this.findUserByFirebaseUid(firebaseUid);
    }

    fields.push('updated_at = ?');
    args.push(new Date().toISOString());

    args.push(firebaseUid);

    await executeSql({
      sql: `UPDATE users SET ${fields.join(', ')} WHERE firebase_uid = ?`,
      args,
    });

    return this.findUserByFirebaseUid(firebaseUid);
  }

  /**
   * Move all rows owned by `oldUid` to `newUid` (Firebase account re-created with the same verified email).
   */
  static async relinkFirebaseUid(oldUid: string, newUid: string): Promise<void> {
    for (const table of ['users', 'daily_usage', 'paper_history', 'subscriptions', 'payments']) {
      await executeSql({
        sql: `UPDATE ${table} SET firebase_uid = ? WHERE firebase_uid = ?`,
        args: [newUid, oldUid],
      });
    }
  }

  /**
   * Update User Plan
   */
  static async updatePlan(firebaseUid: string, plan: UserPlan, expiresAt: string | null = null): Promise<DatabaseUser | null> {
    return this.updateUser(firebaseUid, { plan, plan_expires_at: plan === 'FREE' ? null : expiresAt });
  }

  /**
   * Update User Role
   */
  static async updateRole(firebaseUid: string, role: UserRole): Promise<DatabaseUser | null> {
    return this.updateUser(firebaseUid, { role });
  }

  /**
   * Delete User record
   */
  static async deleteUser(firebaseUid: string): Promise<boolean> {
    for (const table of ['daily_usage', 'paper_history', 'subscriptions', 'users']) {
      await executeSql({
        sql: `DELETE FROM ${table} WHERE firebase_uid = ?`,
        args: [firebaseUid],
      });
    }
    return true;
  }

  /**
   * Helper to format today's date string (YYYY-MM-DD)
   */
  private static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get daily usage record for user on date
   */
  static async getDailyUsage(firebaseUid: string, date?: string): Promise<number> {
    const targetDate = date || this.getTodayDateString();
    const row = await queryOne<{ papers_generated: number }>({
      sql: `SELECT papers_generated FROM daily_usage WHERE firebase_uid = ? AND date = ? LIMIT 1`,
      args: [firebaseUid, targetDate],
    });
    return row?.papers_generated || 0;
  }

  /**
   * Atomically increment the daily usage counter (single upsert, no read-then-write race).
   */
  static async incrementDailyUsage(firebaseUid: string, date?: string): Promise<number> {
    const targetDate = date || this.getTodayDateString();
    const row = await queryOne<{ papers_generated: number }>({
      sql: `INSERT INTO daily_usage (id, firebase_uid, date, papers_generated) VALUES (?, ?, ?, 1)
            ON CONFLICT(firebase_uid, date) DO UPDATE SET papers_generated = papers_generated + 1
            RETURNING papers_generated`,
      args: [crypto.randomUUID(), firebaseUid, targetDate],
    });
    return row?.papers_generated ?? 1;
  }

  /**
   * Atomically consume one generation from today's quota.
   * Returns the new count, or null if the user has already reached `limit`.
   */
  static async tryConsumeDailyUsage(firebaseUid: string, limit: number, date?: string): Promise<number | null> {
    const targetDate = date || this.getTodayDateString();
    if (limit <= 0) return null;
    const row = await queryOne<{ papers_generated: number }>({
      sql: `INSERT INTO daily_usage (id, firebase_uid, date, papers_generated) VALUES (?, ?, ?, 1)
            ON CONFLICT(firebase_uid, date) DO UPDATE SET papers_generated = papers_generated + 1
            WHERE papers_generated < ?
            RETURNING papers_generated`,
      args: [crypto.randomUUID(), firebaseUid, targetDate, limit],
    });
    return row ? row.papers_generated : null;
  }

  /**
   * Give back one generation (e.g. when the AI call failed after quota was consumed).
   */
  static async refundDailyUsage(firebaseUid: string, date?: string): Promise<void> {
    const targetDate = date || this.getTodayDateString();
    await executeSql({
      sql: `UPDATE daily_usage SET papers_generated = MAX(papers_generated - 1, 0) WHERE firebase_uid = ? AND date = ?`,
      args: [firebaseUid, targetDate],
    });
  }

  /**
   * Reset daily usage counter for a given date
   */
  static async resetDailyUsage(firebaseUid: string, date?: string): Promise<void> {
    const targetDate = date || this.getTodayDateString();
    await executeSql({
      sql: `UPDATE daily_usage SET papers_generated = 0 WHERE firebase_uid = ? AND date = ?`,
      args: [firebaseUid, targetDate],
    });
  }

  /**
   * Insert record into paper_history
   */
  static async insertPaperHistory(input: CreatePaperHistoryInput): Promise<PaperHistoryRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const paperJsonStr = typeof input.paper_json === 'string'
      ? input.paper_json
      : JSON.stringify(input.paper_json);

    await executeSql({
      sql: `INSERT INTO paper_history (id, firebase_uid, class, subject, paper_type, marks, difficulty, paper_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        input.firebase_uid,
        input.class,
        input.subject,
        input.paper_type,
        input.marks,
        input.difficulty,
        paperJsonStr,
        now,
      ],
    });

    return {
      id,
      firebase_uid: input.firebase_uid,
      class: input.class,
      subject: input.subject,
      paper_type: input.paper_type,
      marks: input.marks,
      difficulty: input.difficulty,
      paper_json: paperJsonStr,
      created_at: now,
    };
  }

  /**
   * Fetch Paper History list for a user
   */
  static async fetchPaperHistory(firebaseUid: string, limit = 20, offset = 0): Promise<PaperHistoryRecord[]> {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 100) : 20;
    const safeOffset = Number.isFinite(offset) ? Math.max(Math.trunc(offset), 0) : 0;
    limit = safeLimit;
    offset = safeOffset;
    return queryRows<PaperHistoryRecord>({
      sql: `SELECT * FROM paper_history WHERE firebase_uid = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [firebaseUid, limit, offset],
    });
  }

  /**
   * Find a payment by gateway transaction reference (used for idempotent verification)
   */
  static async findPaymentByReference(reference: string): Promise<{ firebase_uid: string; status: string } | null> {
    return queryOne<{ firebase_uid: string; status: string }>({
      sql: `SELECT firebase_uid, status FROM payments WHERE transaction_reference = ? LIMIT 1`,
      args: [reference],
    });
  }

  /**
   * Insert record into payments table
   */
  static async createPayment(input: {
    firebase_uid: string;
    gateway: string;
    amount: number;
    currency?: string;
    status: string;
    transaction_reference: string;
  }): Promise<void> {
    const id = crypto.randomUUID();
    const currency = input.currency || 'INR';
    await executeSql({
      sql: `INSERT INTO payments (id, firebase_uid, gateway, amount, currency, status, transaction_reference, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [id, input.firebase_uid, input.gateway, input.amount, currency, input.status, input.transaction_reference],
    });
  }
}
