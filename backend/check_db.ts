import { pool } from './src/db/pool.js';

async function check() {
  try {
    const res = await pool.query('SELECT * FROM patient_profiles');
    console.log('Profiles:', res.rows);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
