import { AdditionalIntake, CreateAdditionalIntakeInput, DailyTracking, FoodImageAnalysis, MealLog, WeightRecord } from '../models/Tracking';

export interface TrackingRepository {
  createWeightRecord(weightKg: number, notes?: string): Promise<WeightRecord>;
  getWeightRecords(): Promise<WeightRecord[]>;
  getDailyTracking(date: string): Promise<DailyTracking>;
  createMealLog(input: Omit<MealLog, 'id' | 'logDate'>): Promise<MealLog>;
  createAdditionalIntake(input: CreateAdditionalIntakeInput): Promise<AdditionalIntake>;
  analyzeFoodImage(imageBase64: string): Promise<FoodImageAnalysis>;
  confirmAdditionalIntake(id: string): Promise<AdditionalIntake>;
  discardAdditionalIntake(id: string): Promise<void>;
}
