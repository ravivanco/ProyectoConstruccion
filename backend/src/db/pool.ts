import pg from 'pg';

const { Pool } = pg;

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://dkfitt:dkfitt@localhost:5432/dkfitt';

export const pool = new Pool({ connectionString: databaseUrl });

export async function checkDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
