export type EffectivePlanStatus = 'draft' | 'scheduled' | 'active' | 'inactive';

export interface NutritionPlanStatus {
  id: string;
  status: 'draft' | 'active' | 'inactive';
  effectiveStatus: EffectivePlanStatus;
  moduleLocked: boolean;
  moduloHabilitado: boolean;
  startDate?: string;
}
