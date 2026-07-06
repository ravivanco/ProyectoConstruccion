import { ActiveNutritionPlan, NutritionPlanStatus } from '../models/NutritionPlan';
import { PlanWeek } from '../models/WeeklyMenu';

export interface NutritionPlanRepository {
  getStatus(): Promise<NutritionPlanStatus | null>;
  getActive(): Promise<ActiveNutritionPlan | null>;
  getWeeks(planId: string): Promise<PlanWeek[]>;
}
