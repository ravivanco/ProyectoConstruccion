import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { LoginPatient, RegisterPatient } from '../../application/auth/authUseCases';
import { CompleteProfile } from '../../application/profile/CompleteProfile';
import { LoginInput, RegisterInput } from '../../domain/models/Auth';
import { NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { emptyProfile, PatientProfile } from '../../domain/models/Profile';
import { AuthApiRepository, NutritionPlanApiRepository, ProfileApiRepository } from '../../infrastructure/api/ApiRepositories';
import { HttpClient } from '../../infrastructure/api/HttpClient';
import { SecureTokenStorage } from '../../infrastructure/storage/SecureTokenStorage';

interface AppContextValue { session: { authenticated: boolean; completed: boolean }; profile: PatientProfile; register(input: RegisterInput): Promise<void>; login(input: LoginInput): Promise<void>; updateProfile(changes: Partial<PatientProfile>): void; completeProfile(): Promise<void>; getPlanStatus(): Promise<NutritionPlanStatus | null>; reset(): void; }
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const services = useMemo(() => { const client = new HttpClient(); const auth = new AuthApiRepository(client); const storage = new SecureTokenStorage(); return { register: new RegisterPatient(auth, storage), login: new LoginPatient(auth, storage), complete: new CompleteProfile(new ProfileApiRepository(client)), plans: new NutritionPlanApiRepository(client) }; }, []);
  const [session, setSession] = useState({ authenticated: false, completed: false });
  const [profile, setProfile] = useState<PatientProfile>(emptyProfile);
  const value: AppContextValue = {
    session, profile,
    register: async (input) => { await services.register.execute(input); setSession({ authenticated: true, completed: false }); },
    login: async (input) => { const result = await services.login.execute(input); setSession({ authenticated: true, completed: result.profileCompleted }); },
    updateProfile: (changes) => setProfile((current) => ({ ...current, ...changes })),
    completeProfile: async () => { await services.complete.execute(profile); setSession({ authenticated: true, completed: true }); },
    getPlanStatus: () => services.plans.getStatus(),
    reset: () => { setProfile(emptyProfile); setSession({ authenticated: false, completed: false }); },
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() { const context = useContext(AppContext); if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider.'); return context; }
