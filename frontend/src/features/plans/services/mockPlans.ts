import type { WeeklyPlan, DayPlanStructure, DayOfWeek, MealConfig } from '../types';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const createDefaultMeals = (multiplier = 1): MealConfig[] => [
  { id: 'm-1', name: 'Desayuno', suggestedTime: '08:00 AM', targetCalories: Math.round(400 * multiplier), isEnabled: true },
  { id: 'm-2', name: 'Colación matutina', suggestedTime: '11:00 AM', targetCalories: Math.round(150 * multiplier), isEnabled: true },
  { id: 'm-3', name: 'Almuerzo', suggestedTime: '14:00 PM', targetCalories: Math.round(600 * multiplier), isEnabled: true },
  { id: 'm-4', name: 'Colación vespertina', suggestedTime: '17:30 PM', targetCalories: Math.round(150 * multiplier), isEnabled: true },
  { id: 'm-5', name: 'Cena', suggestedTime: '20:30 PM', targetCalories: Math.round(450 * multiplier), isEnabled: true },
];

export const createDefaultWeekStructure = (multiplier = 1): DayPlanStructure[] => {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    meals: createDefaultMeals(multiplier).map((meal) => ({
      ...meal,
      id: `${day}-${meal.id}-${Math.random().toString(36).substring(2, 6)}`,
    })),
  }));
};

export const INITIAL_PLANS: WeeklyPlan[] = [
  {
    id: 'plan-101',
    title: 'Plan Definición y Pérdida de Grasa (1,750 kcal)',
    patientName: 'Sofía Rodríguez',
    objective: 'Pérdida de grasa corporal manteniendo masa muscular',
    includeWeekends: true,
    days: createDefaultWeekStructure(1.0),
    createdAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-06-28T14:30:00.000Z',
  },
  {
    id: 'plan-102',
    title: 'Plan Hipertrofia y Aumento de Fuerza (2,600 kcal)',
    patientName: 'Carlos Mendoza',
    objective: 'Ganancia de masa muscular limpia y rendimiento deportivo',
    includeWeekends: false,
    days: createDefaultWeekStructure(1.5),
    createdAt: '2026-06-20T09:15:00.000Z',
    updatedAt: '2026-07-01T11:20:00.000Z',
  },
  {
    id: 'plan-103',
    title: 'Plan Mantenimiento y Hábitos Saludables (2,000 kcal)',
    patientName: 'Ana Paula Gómez',
    objective: 'Estabilización de peso y control metabólico',
    includeWeekends: true,
    days: createDefaultWeekStructure(1.15),
    createdAt: '2026-06-25T16:45:00.000Z',
    updatedAt: '2026-07-02T18:10:00.000Z',
  },
];
