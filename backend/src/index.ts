import { createApp } from './app.js';
import { checkDbConnection, closePool } from './db/pool.js';

const port = Number(process.env.PORT) || 3000;
const app = createApp();

async function start() {
  const dbConnected = await checkDbConnection();
  if (dbConnected) {
    console.log('PostgreSQL conectado');
  } else {
    console.warn('PostgreSQL no disponible');
  }

  app.listen(port, () => {
    console.log(`DK-FITT API escuchando en http://localhost:${port}`);
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
