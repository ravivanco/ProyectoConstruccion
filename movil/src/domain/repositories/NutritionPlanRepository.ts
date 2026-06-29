import { NutritionPlanStatus } from '../models/NutritionPlan';

export interface NutritionPlanRepository {
  getStatus(): Promise<NutritionPlanStatus | null>;
}
