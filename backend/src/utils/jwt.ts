import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '../types/roles.js';

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

const secret = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret) as TokenPayload;
}
