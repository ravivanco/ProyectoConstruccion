export type MealSlotKey = 'desayuno' | 'colacion_matutina' | 'almuerzo' | 'colacion_vespertina' | 'cena';

export interface AssignedMenu {
  id: string;
  dishId?: string;
  name: string;
  portion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export interface MealConfig {
  mealSlot: MealSlotKey;
  name: string;
  suggestedTime: string;
  order: number;
  assignedMenus: AssignedMenu[];
}

export interface DayPlan {
  day: string;
  dayOfWeek: number;
  meals: MealConfig[];
}

export interface PlanWeek {
  id: string;
  planId: string;
  weekNumber: number;
  title?: string;
  objective?: string;
  includeWeekends: boolean;
  days: DayPlan[];
}

export interface PlanWeeksResponse {
  planId: string;
  weeks: PlanWeek[];
}
