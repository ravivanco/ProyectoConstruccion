export const MEAL_TYPES = [
  'Desayuno',
  'Media Mañana',
  'Almuerzo',
  'Media Tarde',
  'Cena',
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const EXERCISE_CATEGORIES = [
  'Cardio',
  'Fuerza',
  'Flexibilidad',
  'Deporte',
  'Otro',
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export interface MealLog {
  id: string;
  patientId: string;
  mealType: MealType;
  foodName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logDate: string;
  status: MealTrackingStatus;
  notes?: string;
  dishId?: string;
  createdAt: string;
  updatedAt: string;
}

export type MealTrackingStatus = 'pending' | 'completed' | 'skipped';

export interface CreateMealLogInput {
  mealType: MealType;
  foodName?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  logDate?: string;
  status?: MealTrackingStatus;
  notes?: string;
  dishId?: string;
}

export interface UpdateMealLogInput {
  mealType?: MealType;
  foodName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  logDate?: string;
  status?: MealTrackingStatus;
  notes?: string;
  dishId?: string;
}

export interface ExerciseLog {
  id: string;
  patientId: string;
  exerciseName: string;
  category: ExerciseCategory;
  durationMinutes: number;
  caloriesBurned: number;
  logDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseLogInput {
  exerciseName: string;
  category: ExerciseCategory;
  durationMinutes: number;
  caloriesBurned?: number;
  logDate?: string;
  notes?: string;
}

export interface UpdateExerciseLogInput {
  exerciseName?: string;
  category?: ExerciseCategory;
  durationMinutes?: number;
  caloriesBurned?: number;
  logDate?: string;
  notes?: string;
}

export interface WeightLog {
  id: string;
  patientId: string;
  weightKg: number;
  logDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeightLogInput {
  weightKg: number;
  logDate?: string;
  notes?: string;
}

export interface UpdateWeightLogInput {
  weightKg?: number;
  logDate?: string;
  notes?: string;
}

export interface AdditionalFoodLog {
  id: string;
  patientId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: string;
  logDate: string;
  status: AdditionalIntakeStatus;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdditionalIntakeStatus = 'pending' | 'confirmed' | 'discarded';

export interface CreateAdditionalFoodLogInput {
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: string;
  logDate?: string;
  status?: AdditionalIntakeStatus;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateAdditionalFoodLogInput {
  foodName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: string;
  logDate?: string;
  status?: AdditionalIntakeStatus;
  notes?: string;
  imageUrl?: string;
}

export interface FoodVisionAnalysis {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingEstimate: string;
  confidence: 'alta' | 'media' | 'baja';
  notes: string;
  source: 'gemini' | 'template';
}
