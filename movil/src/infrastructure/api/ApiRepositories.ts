import { AuthSession, LoginInput, RegisterInput } from '../../domain/models/Auth';
import { CalorieDashboard } from '../../domain/models/CalorieDashboard';
import { Dish } from '../../domain/models/Dish';
import { AssignedExercise, Exercise } from '../../domain/models/Exercise';
import { ActiveNutritionPlan, NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { PatientProfile } from '../../domain/models/Profile';
import { AdditionalIntake, CreateAdditionalIntakeInput, DailyTracking, FoodImageAnalysis, MealLog, WeightRecord } from '../../domain/models/Tracking';
import { PlanWeeksResponse, PlanWeek } from '../../domain/models/WeeklyMenu';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { CalorieControlRepository } from '../../domain/repositories/CalorieControlRepository';
import { DishRepository } from '../../domain/repositories/DishRepository';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';
import { NutritionPlanRepository } from '../../domain/repositories/NutritionPlanRepository';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { TrackingRepository } from '../../domain/repositories/TrackingRepository';
import { ApiError, HttpClient } from './HttpClient';

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
export class NutritionPlanApiRepository implements NutritionPlanRepository {
  constructor(private readonly client: HttpClient) {}
  async getStatus(): Promise<NutritionPlanStatus | null> {
    try { return await this.client.request<NutritionPlanStatus>('/nutrition-plans/status/me'); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
  }
  async getActive(): Promise<ActiveNutritionPlan | null> {
    try { return await this.client.request<ActiveNutritionPlan>('/nutrition-plans/active/me'); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
  }
  async getWeeks(planId: string): Promise<PlanWeek[]> {
    try {
      const response = await this.client.request<PlanWeeksResponse>(`/nutrition-plans/${encodeURIComponent(planId)}/weeks`);
      return response.weeks;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return [];
      throw error;
    }
  }
}
export class CalorieControlApiRepository implements CalorieControlRepository {
  constructor(private readonly client: HttpClient) {}
  async getDashboard(): Promise<CalorieDashboard | null> {
    try { return await this.client.request<CalorieDashboard>('/calorie-control/dashboard'); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
  }
}
export class DishApiRepository implements DishRepository {
  constructor(private readonly client: HttpClient) {}
  async getById(id: string): Promise<Dish | null> {
    try { return await this.client.request<Dish>(`/dishes/${encodeURIComponent(id)}`); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
  }
}

export class ExerciseApiRepository implements ExerciseRepository {
  constructor(private readonly client: HttpClient) {}
  async getCatalog(category?: string): Promise<Exercise[]> {
    const suffix = category && category !== 'Todas' ? `?category=${encodeURIComponent(category)}` : '';
    return this.client.request<Exercise[]>(`/api/exercises${suffix}`);
  }
  async getRecommendations(): Promise<Exercise[]> {
    try { return await this.client.request<Exercise[]>('/api/exercises/recommendations'); }
    catch (error) {
      if (error instanceof ApiError && [404, 501].includes(error.status)) return this.getCatalog();
      throw error;
    }
  }
  async getWeeklySchedule(planId: string, patientId?: string): Promise<AssignedExercise[]> {
    try {
      if (patientId) return await this.client.request<AssignedExercise[]>(`/api/mobile/patients/${encodeURIComponent(patientId)}/exercises`);
      return await this.client.request<AssignedExercise[]>(`/api/nutrition-plans/${encodeURIComponent(planId)}/exercises`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return [];
      throw error;
    }
  }
}

export class TrackingApiRepository implements TrackingRepository {
  constructor(private readonly client: HttpClient) {}
  async createWeightRecord(weightKg: number, notes?: string): Promise<WeightRecord> {
    return this.client.request<WeightRecord>('/weight-logs/me', { method: 'POST', body: JSON.stringify({ weightKg, notes }) });
  }
  async getWeightRecords(): Promise<WeightRecord[]> {
    try { return await this.client.request<WeightRecord[]>('/weight-logs/me'); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return []; throw error; }
  }
  async getDailyTracking(date: string): Promise<DailyTracking> {
    const query = `?logDate=${encodeURIComponent(date)}`;
    const [mealLogs, additionalIntakes] = await Promise.all([
      this.client.request<MealLog[]>(`/meal-logs/me${query}`).catch((error) => { if (error instanceof ApiError && error.status === 404) return []; throw error; }),
      this.client.request<AdditionalIntake[]>(`/additional-intake/me${query}`).catch((error) => { if (error instanceof ApiError && error.status === 404) return []; throw error; }),
    ]);
    return { mealLogs, additionalIntakes };
  }
  async createMealLog(input: Omit<MealLog, 'id' | 'logDate'>): Promise<MealLog> {
    return this.client.request<MealLog>('/meal-logs/me', { method: 'POST', body: JSON.stringify(input) });
  }
  async createAdditionalIntake(input: CreateAdditionalIntakeInput): Promise<AdditionalIntake> {
    return this.client.request<AdditionalIntake>('/additional-intake/me', { method: 'POST', body: JSON.stringify(input) });
  }
  async analyzeFoodImage(imageBase64: string): Promise<FoodImageAnalysis> {
    return this.client.request<FoodImageAnalysis>('/tracking/analyze-food-image', { method: 'POST', body: JSON.stringify({ imageBase64 }) });
  }
  async confirmAdditionalIntake(id: string): Promise<AdditionalIntake> {
    try { return await this.client.request<AdditionalIntake>(`/additional-intake/${encodeURIComponent(id)}/confirm`, { method: 'PATCH' }); }
    catch (error) {
      if (error instanceof ApiError && error.status === 404) return this.client.request<AdditionalIntake>(`/additional-intake/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ confirmed: true }) });
      throw error;
    }
  }
  async discardAdditionalIntake(id: string): Promise<void> {
    try { await this.client.request(`/additional-intake/${encodeURIComponent(id)}/discard`, { method: 'POST' }); }
    catch (error) {
      if (error instanceof ApiError && error.status === 404) { await this.client.request(`/additional-intake/${encodeURIComponent(id)}`, { method: 'DELETE' }); return; }
      throw error;
    }
  }
}
