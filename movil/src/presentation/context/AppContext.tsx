import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { LoginPatient, RegisterPatient } from '../../application/auth/authUseCases';
import { CompleteProfile } from '../../application/profile/CompleteProfile';
import { LoginInput, RegisterInput } from '../../domain/models/Auth';
import { CalorieDashboard } from '../../domain/models/CalorieDashboard';
import { Dish } from '../../domain/models/Dish';
import { AssignedExercise, Exercise } from '../../domain/models/Exercise';
import { ActiveNutritionPlan, NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { emptyProfile, PatientProfile } from '../../domain/models/Profile';
import { CreateAdditionalIntakeInput, DailyTracking, FoodImageAnalysis, MealLog, WeightRecord } from '../../domain/models/Tracking';
import { PlanWeek } from '../../domain/models/WeeklyMenu';
import { AuthApiRepository, CalorieControlApiRepository, DishApiRepository, ExerciseApiRepository, NutritionPlanApiRepository, ProfileApiRepository, TrackingApiRepository } from '../../infrastructure/api/ApiRepositories';
import { HttpClient } from '../../infrastructure/api/HttpClient';
import { SecureTokenStorage } from '../../infrastructure/storage/SecureTokenStorage';

interface AppContextValue {
  session: { authenticated: boolean; completed: boolean };
  profile: PatientProfile;
  register(input: RegisterInput): Promise<void>;
  login(input: LoginInput): Promise<void>;
  updateProfile(changes: Partial<PatientProfile>): void;
  completeProfile(): Promise<void>;
  getProfile(): Promise<PatientProfile | null>;
  getPlanStatus(): Promise<NutritionPlanStatus | null>;
  getActivePlan(): Promise<ActiveNutritionPlan | null>;
  getPlanWeeks(planId: string): Promise<PlanWeek[]>;
  getDish(id: string): Promise<Dish | null>;
  getCalorieDashboard(): Promise<CalorieDashboard | null>;
  getExercises(category?: string): Promise<Exercise[]>;
  getRecommendedExercises(): Promise<Exercise[]>;
  getExerciseSchedule(planId: string, patientId?: string): Promise<AssignedExercise[]>;
  createWeightRecord(weightKg: number, notes?: string): Promise<WeightRecord>;
  getWeightRecords(): Promise<WeightRecord[]>;
  getDailyTracking(date: string): Promise<DailyTracking>;
  createMealLog(input: Omit<MealLog, 'id' | 'logDate'>): Promise<MealLog>;
  createAdditionalIntake(input: CreateAdditionalIntakeInput): Promise<void>;
  analyzeFoodImage(imageBase64: string): Promise<FoodImageAnalysis>;
  confirmAdditionalIntake(id: string): Promise<void>;
  discardAdditionalIntake(id: string): Promise<void>;
  reset(): void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const services = useMemo(() => {
    const client = new HttpClient();
    const auth = new AuthApiRepository(client);
    const storage = new SecureTokenStorage();
    const profiles = new ProfileApiRepository(client);
    return {
      register: new RegisterPatient(auth, storage),
      login: new LoginPatient(auth, storage),
      complete: new CompleteProfile(profiles),
      profiles,
      plans: new NutritionPlanApiRepository(client),
      dishes: new DishApiRepository(client),
      calories: new CalorieControlApiRepository(client),
      exercises: new ExerciseApiRepository(client),
      tracking: new TrackingApiRepository(client),
    };
  }, []);
  const [session, setSession] = useState({ authenticated: false, completed: false });
  const [profile, setProfile] = useState<PatientProfile>(emptyProfile);
  const value: AppContextValue = {
    session, profile,
    register: async (input) => { await services.register.execute(input); setSession({ authenticated: true, completed: false }); },
    login: async (input) => { const result = await services.login.execute(input); setSession({ authenticated: true, completed: result.profileCompleted }); },
    updateProfile: (changes) => setProfile((current) => ({ ...current, ...changes })),
    completeProfile: async () => { await services.complete.execute(profile); setSession({ authenticated: true, completed: true }); },
    getProfile: async () => { const loaded = await services.profiles.getMe(); if (loaded) setProfile((current) => ({ ...current, ...loaded })); return loaded; },
    getPlanStatus: () => services.plans.getStatus(),
    getActivePlan: () => services.plans.getActive(),
    getPlanWeeks: (planId) => services.plans.getWeeks(planId),
    getDish: (id) => services.dishes.getById(id),
    getCalorieDashboard: () => services.calories.getDashboard(),
    getExercises: (category) => services.exercises.getCatalog(category),
    getRecommendedExercises: () => services.exercises.getRecommendations(),
    getExerciseSchedule: (planId, patientId) => services.exercises.getWeeklySchedule(planId, patientId),
    createWeightRecord: (weightKg, notes) => services.tracking.createWeightRecord(weightKg, notes),
    getWeightRecords: () => services.tracking.getWeightRecords(),
    getDailyTracking: (date) => services.tracking.getDailyTracking(date),
    createMealLog: (input) => services.tracking.createMealLog(input),
    createAdditionalIntake: async (input) => { await services.tracking.createAdditionalIntake(input); },
    analyzeFoodImage: (imageBase64) => services.tracking.analyzeFoodImage(imageBase64),
    confirmAdditionalIntake: async (id) => { await services.tracking.confirmAdditionalIntake(id); },
    discardAdditionalIntake: async (id) => { await services.tracking.discardAdditionalIntake(id); },
    reset: () => { setProfile(emptyProfile); setSession({ authenticated: false, completed: false }); },
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider.');
  return context;
}
