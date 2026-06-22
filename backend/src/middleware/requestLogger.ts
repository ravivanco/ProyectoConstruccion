import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  if (!env.isProduction) {
    console.log(`${req.method} ${req.path}`);
  }
  next();
}
