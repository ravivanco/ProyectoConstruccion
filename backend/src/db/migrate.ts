import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pool } from './pool.js';

function getMigrationsDir(): string {
  const candidates = [
    join(process.cwd(), 'migrations'),
    join(process.cwd(), 'src', 'db', 'migrations'),
    join(process.cwd(), 'dist', 'db', 'migrations'),
  ];
  const found = candidates.find((dir) => existsSync(dir));
  if (!found) throw new Error('No se encontró carpeta de migraciones');
  return found;
}

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = getMigrationsDir();
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = file;
    const applied = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE id = $1',
      [id],
    );
    if (applied.rowCount) continue;

    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const statement of splitSqlStatements(sql)) {
        await client.query(statement);
      }
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    console.log(`Migración aplicada: ${file}`);
  }
}
