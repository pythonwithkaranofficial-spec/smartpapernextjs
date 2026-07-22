import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';

// 1. Manually parse .env.local file to load credentials
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = val;
    }
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ Turso Database URL or Auth Token missing. Ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN exist in .env.local');
  process.exit(1);
}

const client = createClient({ url, authToken });

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    provider TEXT NOT NULL DEFAULT 'email',
    email_verified INTEGER NOT NULL DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'USER',
    plan TEXT NOT NULL DEFAULT 'FREE',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS daily_usage (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT NOT NULL,
    date TEXT NOT NULL,
    papers_generated INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE,
    UNIQUE(firebase_uid, date)
  );`,
  `CREATE TABLE IF NOT EXISTS paper_history (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT NOT NULL,
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    paper_type TEXT NOT NULL,
    marks INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    paper_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'FREE',
    status TEXT NOT NULL DEFAULT 'active',
    expiry_date TEXT,
    payment_gateway TEXT,
    payment_reference TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT NOT NULL,
    gateway TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL,
    transaction_reference TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_daily_usage_uid_date ON daily_usage(firebase_uid, date);`,
  `CREATE INDEX IF NOT EXISTS idx_paper_history_uid ON paper_history(firebase_uid);`,
  `CREATE INDEX IF NOT EXISTS idx_paper_history_created ON paper_history(created_at);`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_uid ON subscriptions(firebase_uid);`,
  `CREATE INDEX IF NOT EXISTS idx_payments_uid ON payments(firebase_uid);`,
];

async function runInitialization() {
  console.log('🚀 Connecting to Turso Database & Initializing Schema...');
  try {
    for (const stmt of statements) {
      await client.execute(stmt);
    }
    console.log('✅ Turso Database Schema and Indexes initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    process.exit(1);
  }
}

runInitialization();
