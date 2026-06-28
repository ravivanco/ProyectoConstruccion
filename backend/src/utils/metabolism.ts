export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';
export type Sex = 'male' | 'female';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

export function calculateBmr(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel = 'moderate'): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function calculateDailyCalorieRequirement(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
  activityLevel: ActivityLevel = 'moderate',
  goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle' = 'maintain_weight',
): { bmr: number; tdee: number; dailyCalories: number } {
  const bmr = calculateBmr(weightKg, heightCm, age, sex);
  const tdee = calculateTdee(bmr, activityLevel);

  let dailyCalories = tdee;
  if (goal === 'lose_weight') dailyCalories = Math.round(tdee * 0.85);
  if (goal === 'gain_muscle') dailyCalories = Math.round(tdee * 1.1);

  return { bmr, tdee, dailyCalories };
}
