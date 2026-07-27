export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';
export type NutritionGoal = 'lose_weight' | 'maintain_weight' | 'gain_muscle';
export interface PatientProfile { activityLevel?: ActivityLevel; medicalConditions: string[]; allergies: string[]; intolerances: string[]; nutritionGoal?: NutritionGoal; sports: string[]; foodPreferences: string[]; foodRestrictions: string[]; completed?: boolean; fullName?: string; email?: string; phone?: string; age?: number; sex?: 'male' | 'female'; heightCm?: number; weightKg?: number; }
export const emptyProfile: PatientProfile = { medicalConditions: [], allergies: [], intolerances: [], sports: [], foodPreferences: [], foodRestrictions: [] };
