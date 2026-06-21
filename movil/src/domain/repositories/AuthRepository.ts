import { AuthSession, LoginInput, RegisterInput } from '../models/Auth';
export interface AuthRepository { register(input: RegisterInput): Promise<AuthSession>; login(input: LoginInput): Promise<AuthSession>; }
export interface TokenStorage { save(token: string): Promise<void>; remove(): Promise<void>; }
