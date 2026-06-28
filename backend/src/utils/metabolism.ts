export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';
export type Sex = 'male' | 'female';
export type NutritionGoal = 'lose_weight' | 'maintain_weight' | 'gain_muscle';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

export interface MetabolismInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel?: ActivityLevel;
  nutritionGoal?: NutritionGoal;
}

export interface MetabolismResult {
  bmi: number;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: { proteinG: number; carbsG: number; fatG: number };
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

/** Tasa metabólica basal (Mifflin-St Jeor) */
export function calculateBmr(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === 'male' ? base + 5 : base - 161;
  return Math.round(bmr);
}

/** Gasto energético total (GET) */
export function calculateTdee(bmr: number, activityLevel: ActivityLevel = 'moderate'): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function calculateMacros(
  dailyCalories: number,
  weightKg: number,
  nutritionGoal: NutritionGoal = 'maintain_weight',
): { proteinG: number; carbsG: number; fatG: number } {
  const proteinPerKg = nutritionGoal === 'gain_muscle' ? 2 : nutritionGoal === 'lose_weight' ? 1.8 : 1.6;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinG * 4;

  const fatRatio = nutritionGoal === 'lose_weight' ? 0.25 : 0.3;
  const fatCalories = dailyCalories * fatRatio;
  const fatG = Math.round(fatCalories / 9);

  const carbsG = Math.max(Math.round((dailyCalories - proteinCalories - fatCalories) / 4), 0);

  return { proteinG, carbsG, fatG };
}

export function calculateMetabolism(input: MetabolismInput): MetabolismResult {
  const bmi = calculateBmi(input.weightKg, input.heightCm);
  const bmr = calculateBmr(input.weightKg, input.heightCm, input.age, input.sex);
  const tdee = calculateTdee(bmr, input.activityLevel ?? 'moderate');

  let dailyCalories = tdee;
  if (input.nutritionGoal === 'lose_weight') dailyCalories = Math.round(tdee * 0.85);
  if (input.nutritionGoal === 'gain_muscle') dailyCalories = Math.round(tdee * 1.1);

  const macros = calculateMacros(dailyCalories, input.weightKg, input.nutritionGoal);

  return { bmi, bmr, tdee, dailyCalories, macros };
}
