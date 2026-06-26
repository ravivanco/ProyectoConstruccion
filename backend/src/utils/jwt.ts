import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Role } from '../types/roles.js';

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

const expiresIn = env.jwtExpiresIn as SignOptions['expiresIn'];

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
