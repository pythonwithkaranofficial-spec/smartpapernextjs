import { UserRole, UserPlan } from './auth';

export interface DatabaseUser {
  id: string;
  firebase_uid: string;
  name: string | null;
  email: string;
  photo_url: string | null;
  provider: string;
  email_verified: number; // 0 or 1 in SQLite
  role: UserRole;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  firebase_uid: string;
  email: string;
  name?: string | null;
  photo_url?: string | null;
  provider?: string;
  email_verified?: boolean | number;
  role?: UserRole;
  plan?: UserPlan;
}

export interface UpdateUserInput {
  name?: string | null;
  photo_url?: string | null;
  email?: string;
  email_verified?: boolean | number;
  role?: UserRole;
  plan?: UserPlan;
}

export interface DailyUsage {
  id: string;
  firebase_uid: string;
  date: string; // YYYY-MM-DD
  papers_generated: number;
}

export interface PaperHistoryRecord {
  id: string;
  firebase_uid: string;
  class: string;
  subject: string;
  paper_type: string;
  marks: number;
  difficulty: string;
  paper_json: string; // JSON serialized paper content
  created_at: string;
}

export interface CreatePaperHistoryInput {
  firebase_uid: string;
  class: string;
  subject: string;
  paper_type: string;
  marks: number;
  difficulty: string;
  paper_json: string | object;
}

export interface Subscription {
  id: string;
  firebase_uid: string;
  plan: UserPlan;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  expiry_date: string | null;
  payment_gateway: string | null;
  payment_reference: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  firebase_uid: string;
  gateway: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  transaction_reference: string;
  created_at: string;
}
