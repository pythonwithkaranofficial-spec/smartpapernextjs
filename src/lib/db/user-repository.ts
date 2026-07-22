import { executeSql, queryOne, queryRows } from '../turso';
import { DatabaseUser, PaperHistoryRecord, CreatePaperHistoryInput } from '@/types/db';
import { UserRole, UserPlan } from '@/types/auth';

export class UserRepository {
  /**
   * Find a user record by Firebase UID
   */
  static async findUserByFirebaseUid(firebaseUid: string): Promise<DatabaseUser | null> {
    return queryOne<DatabaseUser>({
      sql: `SELECT * FROM users WHERE firebase_uid = ? LIMIT 1`,
      args: [firebaseUid],
    });
  }

  /**
   * Find a user record by Email Address
   */
  static async findUserByEmail(email: string): Promise<DatabaseUser | null> {
    return queryOne<DatabaseUser>({
      sql: `SELECT * FROM users WHERE email = ? LIMIT 1`,
      args: [email],
    });
  }

  /**
   * Insert new user record into Turso DB
   */
  static async createUser(user: Partial<DatabaseUser> & { firebase_uid: string; email: string }): Promise<DatabaseUser> {
    const id = user.id || crypto.randomUUID();
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
      args: [id, user.firebase_uid, name, user.email, photoUrl, provider, emailVerified, role, plan, now, now],
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
   * Update User Plan
   */
  static async updatePlan(firebaseUid: string, plan: UserPlan): Promise<DatabaseUser | null> {
    return this.updateUser(firebaseUid, { plan });
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
    await executeSql({
      sql: `DELETE FROM users WHERE firebase_uid = ?`,
      args: [firebaseUid],
    });
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
   * Increment daily usage counter for user
   */
  static async incrementDailyUsage(firebaseUid: string, date?: string): Promise<number> {
    const targetDate = date || this.getTodayDateString();
    const existing = await queryOne<{ id: string; papers_generated: number }>({
      sql: `SELECT id, papers_generated FROM daily_usage WHERE firebase_uid = ? AND date = ? LIMIT 1`,
      args: [firebaseUid, targetDate],
    });

    if (existing) {
      const newCount = existing.papers_generated + 1;
      await executeSql({
        sql: `UPDATE daily_usage SET papers_generated = ? WHERE id = ?`,
        args: [newCount, existing.id],
      });
      return newCount;
    } else {
      const id = crypto.randomUUID();
      await executeSql({
        sql: `INSERT INTO daily_usage (id, firebase_uid, date, papers_generated) VALUES (?, ?, ?, 1)`,
        args: [id, firebaseUid, targetDate],
      });
      return 1;
    }
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
    return queryRows<PaperHistoryRecord>({
      sql: `SELECT * FROM paper_history WHERE firebase_uid = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [firebaseUid, limit, offset],
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
