export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';
export type NutritionGoal = 'lose_weight' | 'maintain_weight' | 'gain_muscle';

export interface PatientProfile {
  patientId: string;
  activityLevel?: ActivityLevel;
  medicalConditions: string[];
  allergies: string[];
  intolerances: string[];
  nutritionGoal?: NutritionGoal;
  sports: string[];
  foodPreferences: string[];
  foodRestrictions: string[];
  completed: boolean;
  updatedAt: string;
}

export interface UpsertPatientProfileInput {
  activityLevel?: ActivityLevel;
  medicalConditions?: string[];
  allergies?: string[];
  intolerances?: string[];
  nutritionGoal?: NutritionGoal;
  sports?: string[];
  foodPreferences?: string[];
  foodRestrictions?: string[];
  completed?: boolean;
}
