export type MealType = 'Desayuno' | 'Colación matutina' | 'Almuerzo' | 'Colación vespertina' | 'Cena';

export interface MealConfig {
  id: string;
  name: MealType | string;
  suggestedTime: string; // ej. "08:00 AM", "14:00 PM"
  targetCalories: number; // kcal sugeridas por toma
  isEnabled: boolean;
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
