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
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (id) VALUES ($1)', [id]);
    console.log(`Migración aplicada: ${file}`);
  }
}
