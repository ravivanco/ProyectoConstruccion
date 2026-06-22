import { Router } from 'express';

export const indexRouter = Router();

indexRouter.get('/', (_req, res) => {
  res.json({
    name: 'DK-FITT API',
    version: '1.0.0',
    status: 'running',
    docs: '/api-docs',
  });
});
