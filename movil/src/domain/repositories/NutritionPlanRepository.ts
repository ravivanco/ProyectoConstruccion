import { ActiveNutritionPlan, NutritionPlanStatus } from '../models/NutritionPlan';

export interface NutritionPlanRepository {
  getStatus(): Promise<NutritionPlanStatus | null>;
  getActive(): Promise<ActiveNutritionPlan | null>;
}
