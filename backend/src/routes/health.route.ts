import { Router } from 'express';
import { checkDbConnection } from '../db/pool.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const dbConnected = await checkDbConnection();

  const body = {
    status: dbConnected ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    database: dbConnected ? 'connected' : 'disconnected',
  };

  res.status(dbConnected ? 200 : 503).json(body);
});
