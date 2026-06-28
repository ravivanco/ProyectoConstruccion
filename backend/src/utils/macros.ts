export type NutritionGoal = 'lose_weight' | 'maintain_weight' | 'gain_muscle';

export interface MacroDistribution {
  patientId: string;
  dailyCalories: number;
  weightKg: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  percentages: { protein: number; carbs: number; fat: number };
}

export function calculateMacroDistribution(
  dailyCalories: number,
  weightKg: number,
  goal: NutritionGoal = 'maintain_weight',
): Omit<MacroDistribution, 'patientId'> {
  const proteinPerKg = goal === 'gain_muscle' ? 2 : goal === 'lose_weight' ? 1.8 : 1.6;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinG * 4;

  const fatRatio = goal === 'lose_weight' ? 0.25 : 0.3;
  const fatCalories = dailyCalories * fatRatio;
  const fatG = Math.round(fatCalories / 9);

  const carbsG = Math.max(Math.round((dailyCalories - proteinCalories - fatCalories) / 4), 0);

  const protein = Math.round((proteinCalories / dailyCalories) * 100);
  const fat = Math.round((fatCalories / dailyCalories) * 100);
  const carbs = Math.max(100 - protein - fat, 0);

  return {
    dailyCalories,
    weightKg,
    proteinG,
    carbsG,
    fatG,
    percentages: { protein, carbs, fat },
  };
}
