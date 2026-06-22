import cors from 'cors';
import { RequestHandler } from 'express';
import { env } from '../config/env.js';

export const corsMiddleware: RequestHandler = cors({
  origin:
    env.corsOrigin === '*'
      ? '*'
      : env.corsOrigin.split(',').map((value) => value.trim()),
});
