export type EffectivePlanStatus = 'draft' | 'scheduled' | 'active' | 'inactive';

export interface NutritionPlanStatus {
  id: string;
  status: 'draft' | 'active' | 'inactive';
  effectiveStatus: EffectivePlanStatus;
  moduleLocked: boolean;
  moduloHabilitado: boolean;
  startDate?: string;
}

export interface ActiveNutritionPlan {
  id: string;
  status: 'active';
  moduleLocked: boolean;
  moduloHabilitado: boolean;
  startDate?: string;
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  activatedAt?: string;
}
