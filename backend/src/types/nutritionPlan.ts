export type NutritionPlanStatus = 'draft' | 'active' | 'inactive';

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
