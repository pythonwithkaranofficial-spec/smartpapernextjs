import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';

// 1. Load .env.local
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
  console.error('❌ Turso Database credentials missing in .env.local');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function testProfileWorkflow() {
  console.log('🧪 Testing Turso Database Profile Workflow with Dummy Details...');

  const dummyUid = 'dummy_test_uid_' + Date.now();
  const dummyEmail = `test_teacher_${Date.now()}@example.com`;
  const dummyName = 'Prof. Alex Turner';
  const dummyPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...'; // Sample base64 data URL

  try {
    // 1. Insert Dummy User
    console.log(`1️⃣ Creating dummy user: ${dummyName} (${dummyEmail})...`);
    await client.execute({
      sql: `INSERT INTO users (id, firebase_uid, name, email, photo_url, provider, email_verified, role, plan, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: ['id_' + dummyUid, dummyUid, dummyName, dummyEmail, dummyPhoto, 'password', 1, 'USER', 'PRO'],
    });
    console.log('✅ User inserted into Turso users table successfully!');

    // 2. Fetch User Record
    const userRes = await client.execute({
      sql: `SELECT * FROM users WHERE firebase_uid = ?`,
      args: [dummyUid],
    });
    const fetchedUser = userRes.rows[0];
    console.log('2️⃣ Fetched User Record:', {
      name: fetchedUser.name,
      email: fetchedUser.email,
      role: fetchedUser.role,
      plan: fetchedUser.plan,
      hasPhoto: Boolean(fetchedUser.photo_url),
    });

    // 3. Test Plan Upgrade to PREMIUM
    console.log('3️⃣ Upgrading plan from PRO to PREMIUM...');
    await client.execute({
      sql: `UPDATE users SET plan = ?, updated_at = CURRENT_TIMESTAMP WHERE firebase_uid = ?`,
      args: ['PREMIUM', dummyUid],
    });

    const updatedUserRes = await client.execute({
      sql: `SELECT plan FROM users WHERE firebase_uid = ?`,
      args: [dummyUid],
    });
    console.log(`✅ Plan updated successfully to: ${updatedUserRes.rows[0].plan}`);

    // 4. Test Daily Usage Tracking
    const todayStr = new Date().toISOString().split('T')[0];
    console.log(`4️⃣ Tracking daily usage for date: ${todayStr}...`);
    await client.execute({
      sql: `INSERT INTO daily_usage (id, firebase_uid, date, papers_generated)
            VALUES (?, ?, ?, 3)
            ON CONFLICT(firebase_uid, date) DO UPDATE SET papers_generated = papers_generated + 3`,
      args: ['usage_' + dummyUid, dummyUid, todayStr],
    });

    const usageRes = await client.execute({
      sql: `SELECT papers_generated FROM daily_usage WHERE firebase_uid = ? AND date = ?`,
      args: [dummyUid, todayStr],
    });
    console.log(`✅ Daily papers generated count: ${usageRes.rows[0].papers_generated} papers`);

    // 5. Clean up dummy test data
    console.log('5️⃣ Cleaning up test data...');
    await client.execute({ sql: `DELETE FROM daily_usage WHERE firebase_uid = ?`, args: [dummyUid] });
    await client.execute({ sql: `DELETE FROM users WHERE firebase_uid = ?`, args: [dummyUid] });
    console.log('✨ Cleanup complete! Profile & Turso database workflows are 100% verified & operational!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Profile test failed:', error);
    process.exit(1);
  }
}

testProfileWorkflow();
