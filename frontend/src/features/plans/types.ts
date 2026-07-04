export type MealType = 'Desayuno' | 'Colación matutina' | 'Almuerzo' | 'Colación vespertina' | 'Cena';

export type DishCategory = 'Desayunos' | 'Almuerzos / Cenas' | 'Colaciones' | 'Bebidas y Batidos';

export interface DishTemplate {
  id: string;
  name: string;
  category: DishCategory;
  defaultPortion: string; // ej. "1 porción (250g)"
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  tags?: string[]; // ej. ["Alto en Proteína", "Bajo en Carbos", "Sin Gluten"]
}

export interface AssignedMenu {
  id: string;
  dishId: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: DishCategory;
  notes?: string;
}

export interface MealConfig {
  id: string;
  name: MealType | string;
  suggestedTime: string; // ej. "08:00 AM", "14:00 PM"
  targetCalories: number; // kcal sugeridas por toma
  isEnabled: boolean;
  assignedMenus?: AssignedMenu[]; // Platos o menús asignados a este tiempo de comida
  notes?: string;
}

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export interface DayPlanStructure {
  day: DayOfWeek;
  meals: MealConfig[];
}

export interface WeeklyPlan {
  id: string;
  title: string;
  patientName?: string;
  objective: string;
  includeWeekends: boolean; // false -> Lunes a Viernes (5 días), true -> Lunes a Domingo (7 días)
  days: DayPlanStructure[];
  createdAt: string;
  updatedAt: string;
}
