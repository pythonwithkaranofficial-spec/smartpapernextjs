import { queryOne, queryRows, executeSql } from '../turso';
import { DatabaseUser, CreateUserInput, UpdateUserInput, DailyUsage, PaperHistoryRecord, CreatePaperHistoryInput } from '../../types/db';
import { UserPlan, UserRole } from '../../types/auth';
import { DatabaseError, NotFoundError } from '../errors';

export class UserRepository {
  /**
   * Helper to format current ISO date (YYYY-MM-DD)
   */
  private static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Create a new user in the database
   */
  static async createUser(input: CreateUserInput): Promise<DatabaseUser> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const provider = input.provider || 'email';
    const emailVerified = input.email_verified ? 1 : 0;
    const role = input.role || 'USER';
    const plan = input.plan || 'FREE';

    try {
      await executeSql({
        sql: `INSERT INTO users (id, firebase_uid, name, email, photo_url, provider, email_verified, role, plan, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          input.firebase_uid,
          input.name || null,
          input.email,
          input.photo_url || null,
          provider,
          emailVerified,
          role,
          plan,
          now,
          now,
        ],
      });

      const createdUser = await this.findUserByFirebaseUid(input.firebase_uid);
      if (!createdUser) {
        throw new DatabaseError('Failed to fetch newly created user record');
      }
      return createdUser;
    } catch (error) {
      console.error('[UserRepository.createUser Error]:', error);
      throw new DatabaseError(`Could not create user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Find a user by Firebase UID
   */
  static async findUserByFirebaseUid(firebaseUid: string): Promise<DatabaseUser | null> {
    return queryOne<DatabaseUser>({
      sql: `SELECT * FROM users WHERE firebase_uid = ? LIMIT 1`,
      args: [firebaseUid],
    });
  }

  /**
   * Find a user by Email address
   */
  static async findUserByEmail(email: string): Promise<DatabaseUser | null> {
    return queryOne<DatabaseUser>({
      sql: `SELECT * FROM users WHERE email = ? LIMIT 1`,
      args: [email],
    });
  }

  /**
   * Update user details
   */
  static async updateUser(firebaseUid: string, input: UpdateUserInput): Promise<DatabaseUser> {
    const existing = await this.findUserByFirebaseUid(firebaseUid);
    if (!existing) {
      throw new NotFoundError(`User with Firebase UID ${firebaseUid} not found`);
    }

    const now = new Date().toISOString();
    const name = input.name !== undefined ? input.name : existing.name;
    const photoUrl = input.photo_url !== undefined ? input.photo_url : existing.photo_url;
    const email = input.email !== undefined ? input.email : existing.email;
    const emailVerified = input.email_verified !== undefined ? (input.email_verified ? 1 : 0) : existing.email_verified;
    const role = input.role !== undefined ? input.role : existing.role;
    const plan = input.plan !== undefined ? input.plan : existing.plan;

    await executeSql({
      sql: `UPDATE users
            SET name = ?, photo_url = ?, email = ?, email_verified = ?, role = ?, plan = ?, updated_at = ?
            WHERE firebase_uid = ?`,
      args: [name, photoUrl, email, emailVerified, role, plan, now, firebaseUid],
    });

    const updated = await this.findUserByFirebaseUid(firebaseUid);
    if (!updated) {
      throw new DatabaseError('Failed to fetch updated user record');
    }
    return updated;
  }

  /**
   * Update User Plan
   */
  static async updatePlan(firebaseUid: string, plan: UserPlan): Promise<void> {
    const now = new Date().toISOString();
    await executeSql({
      sql: `UPDATE users SET plan = ?, updated_at = ? WHERE firebase_uid = ?`,
      args: [plan, now, firebaseUid],
    });
  }

  /**
   * Update User Role
   */
  static async updateRole(firebaseUid: string, role: UserRole): Promise<void> {
    const now = new Date().toISOString();
    await executeSql({
      sql: `UPDATE users SET role = ?, updated_at = ? WHERE firebase_uid = ?`,
      args: [role, now, firebaseUid],
    });
  }

  /**
   * Delete User
   */
  static async deleteUser(firebaseUid: string): Promise<void> {
    await executeSql({
      sql: `DELETE FROM users WHERE firebase_uid = ?`,
      args: [firebaseUid],
    });
  }

  /**
   * Fetch Daily Usage record for a user
   */
  static async getDailyUsage(firebaseUid: string, date?: string): Promise<DailyUsage> {
    const targetDate = date || this.getTodayDateString();
    const usage = await queryOne<DailyUsage>({
      sql: `SELECT * FROM daily_usage WHERE firebase_uid = ? AND date = ? LIMIT 1`,
      args: [firebaseUid, targetDate],
    });

    if (usage) {
      return usage;
    }

    return {
      id: '',
      firebase_uid: firebaseUid,
      date: targetDate,
      papers_generated: 0,
    };
  }

  /**
   * Increment papers_generated count for the day
   */
  static async incrementDailyUsage(firebaseUid: string, date?: string): Promise<number> {
    const targetDate = date || this.getTodayDateString();
    const existing = await queryOne<DailyUsage>({
      sql: `SELECT * FROM daily_usage WHERE firebase_uid = ? AND date = ? LIMIT 1`,
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
}
