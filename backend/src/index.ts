import './loadEnv.js';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { checkDbConnection, closePool } from './db/pool.js';
import { runMigrations } from './db/migrate.js';

const app = createApp();

async function start() {
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    console.log('PostgreSQL conectado');
    await runMigrations();
  } else {
    console.warn('PostgreSQL no disponible');
  }

  app.listen(env.port, () => {
    console.log(`DK-FITT API escuchando en http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
