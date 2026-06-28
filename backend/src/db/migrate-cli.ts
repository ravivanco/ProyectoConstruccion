import '../loadEnv.js';
import { runMigrations } from './migrate.js';
import { closePool } from './pool.js';

runMigrations()
  .then(async () => {
    await closePool();
    console.log('Migraciones completadas');
  })
  .catch(async (error) => {
    console.error(error);
    await closePool();
    process.exit(1);
  });
