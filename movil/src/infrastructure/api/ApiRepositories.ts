import { AuthSession, LoginInput, RegisterInput } from '../../domain/models/Auth';
import { PatientProfile } from '../../domain/models/Profile';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { HttpClient } from './HttpClient';

interface AuthResponse { accessToken: string; profileCompleted?: boolean; }
export class AuthApiRepository implements AuthRepository {
  constructor(private readonly client: HttpClient) {}
  async register(input: RegisterInput): Promise<AuthSession> { const response = await this.client.request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) }); this.client.setToken(response.accessToken); return { accessToken: response.accessToken, profileCompleted: false }; }
  async login(input: LoginInput): Promise<AuthSession> { const response = await this.client.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }); this.client.setToken(response.accessToken); return { accessToken: response.accessToken, profileCompleted: Boolean(response.profileCompleted) }; }
}
export class ProfileApiRepository implements ProfileRepository {
  constructor(private readonly client: HttpClient) {}
  async complete(profile: PatientProfile) { await this.client.request('/patient-profile/me', { method: 'PUT', body: JSON.stringify({ ...profile, completed: true }) }); }
}
