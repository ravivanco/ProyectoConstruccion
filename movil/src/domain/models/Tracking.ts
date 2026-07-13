export type MealStatus = 'pending' | 'completed' | 'skipped';

export interface WeightRecord {
  id: string;
  patientId?: string;
  weightKg: number;
  logDate: string;
  notes?: string;
}

export interface MealLog {
  id: string;
  mealType: string;
  foodName?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  logDate: string;
  status?: MealStatus;
  dishId?: string;
}

export interface AdditionalIntake {
  id: string;
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: string;
  logDate: string;
  imageUrl?: string;
  notes?: string;
  confirmed?: boolean;
}

export interface FoodImageAnalysis {
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: string;
  confidence?: number;
}

export interface DailyTracking {
  mealLogs: MealLog[];
  additionalIntakes: AdditionalIntake[];
}

export interface CreateAdditionalIntakeInput {
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: string;
  imageUrl?: string;
  notes?: string;
}
