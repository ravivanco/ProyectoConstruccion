export type Sex = 'female' | 'male' | 'other';
export interface RegisterInput { firstName: string; lastName: string; email: string; password: string; sex: Sex; birthDate: string; }
export interface LoginInput { email: string; password: string; }
export interface AuthSession { accessToken: string; profileCompleted: boolean; }
