import cors from 'cors';
import { RequestHandler } from 'express';

const origin = process.env.CORS_ORIGIN ?? '*';

export const corsMiddleware: RequestHandler = cors({
  origin: origin === '*' ? '*' : origin.split(',').map((value) => value.trim()),
});
