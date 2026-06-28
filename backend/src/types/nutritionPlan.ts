export type NutritionPlanStatus = 'draft' | 'active' | 'inactive';
export type EffectivePlanStatus = 'draft' | 'scheduled' | 'active' | 'inactive';

export interface NutritionPlan {
  id: string;
  patientId: string;
  nutritionistId: string;
  status: NutritionPlanStatus;
  moduleLocked: boolean;
  startDate?: string;
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivePlanForPatient extends NutritionPlan {
  moduloHabilitado: boolean;
}

export interface PlanStatusView extends NutritionPlan {
  effectiveStatus: EffectivePlanStatus;
  moduloHabilitado: boolean;
}

export function resolvePlanStatus(plan: NutritionPlan): PlanStatusView {
  const today = new Date().toISOString().slice(0, 10);

  if (plan.status === 'draft') {
    return { ...plan, effectiveStatus: 'draft', moduloHabilitado: false };
  }

  if (plan.status === 'inactive') {
    return { ...plan, effectiveStatus: 'inactive', moduloHabilitado: false };
  }

  if (plan.startDate && plan.startDate > today) {
    return { ...plan, effectiveStatus: 'scheduled', moduloHabilitado: false };
  }

  return {
    ...plan,
    effectiveStatus: 'active',
    moduloHabilitado: !plan.moduleLocked,
  };
}
