import { createClient, Client, InStatement, ResultSet } from '@libsql/client';
import { DatabaseError } from './errors';

let clientInstance: Client | null = null;

export function getTursoClient(): Client {
  if (clientInstance) {
    return clientInstance;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new DatabaseError(
      'Turso database credentials missing. Ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env.local',
      500,
      'MISSING_TURSO_CONFIG'
    );
  }

  try {
    clientInstance = createClient({
      url,
      authToken,
    });
    return clientInstance;
  } catch (error) {
    console.error('[Turso Connection Error]:', error);
    throw new DatabaseError('Failed to initialize Turso database client', 500, 'TURSO_INIT_FAILED');
  }
}

export async function executeSql(statement: InStatement): Promise<ResultSet> {
  const client = getTursoClient();
  try {
    return await client.execute(statement);
  } catch (error) {
    console.error('[Turso Query Execution Error]:', error);
    throw new DatabaseError(
      `Turso query execution failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function queryRows<T = Record<string, unknown>>(statement: InStatement): Promise<T[]> {
  const rs = await executeSql(statement);
  return rs.rows as unknown as T[];
}

export async function queryOne<T = Record<string, unknown>>(statement: InStatement): Promise<T | null> {
  const rows = await queryRows<T>(statement);
  return rows.length > 0 ? rows[0] : null;
}

export async function tursoHealthCheck(): Promise<boolean> {
  try {
    const res = await executeSql('SELECT 1 as alive;');
    return res.rows.length > 0;
  } catch (error) {
    console.error('[Turso Health Check Failed]:', error);
    return false;
  }
}
