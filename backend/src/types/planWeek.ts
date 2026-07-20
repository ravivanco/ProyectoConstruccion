export const MEAL_SLOTS = [
  { key: 'desayuno', name: 'Desayuno', order: 1, suggestedTime: '07:00' },
  { key: 'colacion_matutina', name: 'Colación matutina', order: 2, suggestedTime: '10:00' },
  { key: 'almuerzo', name: 'Almuerzo', order: 3, suggestedTime: '13:00' },
  { key: 'colacion_vespertina', name: 'Colación vespertina', order: 4, suggestedTime: '16:00' },
  { key: 'cena', name: 'Cena', order: 5, suggestedTime: '19:00' },
] as const;

export type MealSlotKey = (typeof MEAL_SLOTS)[number]['key'];

export const DAY_LABELS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export type DayLabel = (typeof DAY_LABELS)[number];

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

export interface DayPlanStructure {
  day: DayLabel;
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
  days: DayPlanStructure[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanWeekInput {
  weekNumber?: number;
  title?: string;
  objective?: string;
  includeWeekends?: boolean;
}

export interface AssignDayMenuInput {
  mealSlot: MealSlotKey;
  dishId?: string;
  dishName: string;
  portion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}
