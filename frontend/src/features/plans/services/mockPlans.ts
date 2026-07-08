import type { WeeklyPlan, DayPlanStructure, DayOfWeek, MealConfig, DishTemplate } from '../types';

export const DISH_CATALOG: DishTemplate[] = [
  // Desayunos
  {
    id: 'dish-1',
    name: 'Omelette de claras y espinacas con pan integral',
    category: 'Desayunos',
    defaultPortion: '1 porción (300g)',
    calories: 380,
    protein: 28,
    carbs: 30,
    fat: 12,
    tags: ['Alto en Proteína', 'Bajo en Grasa', 'Saciante']
  },
  {
    id: 'dish-2',
    name: 'Avena trasnochada con proteína y arándanos',
    category: 'Desayunos',
    defaultPortion: '1 tazón (280g)',
    calories: 420,
    protein: 32,
    carbs: 48,
    fat: 8,
    tags: ['Alto en Proteína', 'Fibra', 'Rápido']
  },
  {
    id: 'dish-3',
    name: 'Tostadas con aguacate, huevo pochado y semillas',
    category: 'Desayunos',
    defaultPortion: '2 rebanadas (250g)',
    calories: 450,
    protein: 22,
    carbs: 35,
    fat: 24,
    tags: ['Grasas Saludables', 'Energético']
  },
  {
    id: 'dish-4',
    name: 'Yogurt griego descremado con granola y fresas',
    category: 'Desayunos',
    defaultPortion: '1 copa (220g)',
    calories: 320,
    protein: 20,
    carbs: 45,
    fat: 6,
    tags: ['Probióticos', 'Rápido', 'Digestivo']
  },

  // Almuerzos / Cenas
  {
    id: 'dish-5',
    name: 'Salmón a la plancha con espárragos y quinua',
    category: 'Almuerzos / Cenas',
    defaultPortion: '1 filete + guarnición (350g)',
    calories: 580,
    protein: 42,
    carbs: 40,
    fat: 26,
    tags: ['Omega 3', 'Alto en Proteína', 'Antiinflamatorio']
  },
  {
    id: 'dish-6',
    name: 'Pechuga de pollo al limón con arroz integral y brócoli',
    category: 'Almuerzos / Cenas',
    defaultPortion: '1 porción completa (380g)',
    calories: 520,
    protein: 48,
    carbs: 45,
    fat: 12,
    tags: ['Clásico Fitness', 'Alto en Proteína', 'Bajo en Grasa']
  },
  {
    id: 'dish-7',
    name: 'Bowl mediterráneo con garbanzos, atún y aguacate',
    category: 'Almuerzos / Cenas',
    defaultPortion: '1 bowl grande (320g)',
    calories: 480,
    protein: 35,
    carbs: 42,
    fat: 18,
    tags: ['Mediterráneo', 'Fibra', 'Sin Gluten']
  },
  {
    id: 'dish-8',
    name: 'Lomo de res salteado al wok con vegetales frescos',
    category: 'Almuerzos / Cenas',
    defaultPortion: '1 porción al wok (360g)',
    calories: 620,
    protein: 50,
    carbs: 48,
    fat: 22,
    tags: ['Hierro', 'Alto en Proteína', 'Hipertrofia']
  },
  {
    id: 'dish-9',
    name: 'Tacos de pescado blanco con tortilla de maíz y pico de gallo',
    category: 'Almuerzos / Cenas',
    defaultPortion: '3 tacos (300g)',
    calories: 440,
    protein: 36,
    carbs: 38,
    fat: 14,
    tags: ['Ligero', 'Bajo en Grasa', 'Gourmet']
  },

  // Colaciones
  {
    id: 'dish-10',
    name: 'Manzana verde con crema de almendras natural',
    category: 'Colaciones',
    defaultPortion: '1 pieza + 1 cda (160g)',
    calories: 180,
    protein: 4,
    carbs: 22,
    fat: 9,
    tags: ['Snack Rápido', 'Grasas Buenas']
  },
  {
    id: 'dish-11',
    name: 'Batido de proteína Isolate con leche de almendras',
    category: 'Colaciones',
    defaultPortion: '1 vaso (350ml)',
    calories: 140,
    protein: 26,
    carbs: 4,
    fat: 2,
    tags: ['Bajo en Carbos', 'Post-entreno', 'Líquido']
  },
  {
    id: 'dish-12',
    name: 'Mix de frutos secos natural y semillas de calabaza',
    category: 'Colaciones',
    defaultPortion: '1 puñado (35g)',
    calories: 210,
    protein: 6,
    carbs: 8,
    fat: 18,
    tags: ['Keto friendly', 'Energía duradera']
  },
  {
    id: 'dish-13',
    name: 'Rollitos de pechuga de pavo con pepino y queso cottage',
    category: 'Colaciones',
    defaultPortion: '4 rollitos (150g)',
    calories: 150,
    protein: 18,
    carbs: 4,
    fat: 6,
    tags: ['Bajo en Calorías', 'Saciedad', 'Proteico']
  },

  // Bebidas y Batidos
  {
    id: 'dish-14',
    name: 'Smoothie verde Detox con espinaca, apio y jengibre',
    category: 'Bebidas y Batidos',
    defaultPortion: '1 vaso grande (400ml)',
    calories: 90,
    protein: 2,
    carbs: 18,
    fat: 1,
    tags: ['Detox', 'Vitamínico', 'Bajo en Calorías']
  },
  {
    id: 'dish-15',
    name: 'Batido de plátano, creatina y cacao puro',
    category: 'Bebidas y Batidos',
    defaultPortion: '1 shaker (400ml)',
    calories: 280,
    protein: 28,
    carbs: 35,
    fat: 4,
    tags: ['Energético', 'Recuperador muscular']
  }
];

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
  { id: 'm-1', name: 'Desayuno', suggestedTime: '08:00 AM', targetCalories: Math.round(400 * multiplier), isEnabled: true, assignedMenus: [] },
  { id: 'm-2', name: 'Colación matutina', suggestedTime: '11:00 AM', targetCalories: Math.round(150 * multiplier), isEnabled: true, assignedMenus: [] },
  { id: 'm-3', name: 'Almuerzo', suggestedTime: '14:00 PM', targetCalories: Math.round(600 * multiplier), isEnabled: true, assignedMenus: [] },
  { id: 'm-4', name: 'Colación vespertina', suggestedTime: '17:30 PM', targetCalories: Math.round(150 * multiplier), isEnabled: true, assignedMenus: [] },
  { id: 'm-5', name: 'Cena', suggestedTime: '20:30 PM', targetCalories: Math.round(450 * multiplier), isEnabled: true, assignedMenus: [] },
];

export const createDefaultWeekStructure = (multiplier = 1, populateSampleMenus = false): DayPlanStructure[] => {
  return DAYS_OF_WEEK.map((day, dayIndex) => {
    const meals = createDefaultMeals(multiplier).map((meal, mealIndex) => {
      const mealId = `${day}-${meal.id}-${Math.random().toString(36).substring(2, 6)}`;
      let assignedMenus = [];

      // Si populateSampleMenus es true, asignamos menús por defecto a Lunes y Martes para que la grilla no esté vacía
      if (populateSampleMenus && (dayIndex === 0 || dayIndex === 1)) {
        if (mealIndex === 0) { // Desayuno
          const dish = DISH_CATALOG[dayIndex === 0 ? 0 : 1];
          assignedMenus.push({
            id: `ass-${Math.random().toString(36).substring(2, 7)}`,
            dishId: dish.id,
            name: dish.name,
            portion: dish.defaultPortion,
            calories: dish.calories,
            protein: dish.protein,
            carbs: dish.carbs,
            fat: dish.fat,
            category: dish.category
          });
        } else if (mealIndex === 2) { // Almuerzo
          const dish = DISH_CATALOG[dayIndex === 0 ? 4 : 5];
          assignedMenus.push({
            id: `ass-${Math.random().toString(36).substring(2, 7)}`,
            dishId: dish.id,
            name: dish.name,
            portion: dish.defaultPortion,
            calories: dish.calories,
            protein: dish.protein,
            carbs: dish.carbs,
            fat: dish.fat,
            category: dish.category
          });
        } else if (mealIndex === 1 || mealIndex === 3) { // Colación
          const dish = DISH_CATALOG[dayIndex === 0 ? 9 : 10];
          assignedMenus.push({
            id: `ass-${Math.random().toString(36).substring(2, 7)}`,
            dishId: dish.id,
            name: dish.name,
            portion: dish.defaultPortion,
            calories: dish.calories,
            protein: dish.protein,
            carbs: dish.carbs,
            fat: dish.fat,
            category: dish.category
          });
        }
      }

      return {
        ...meal,
        id: mealId,
        assignedMenus
      };
    });

    return {
      day,
      meals
    };
  });
};

export const INITIAL_PLANS: WeeklyPlan[] = [
  {
    id: 'plan-101',
    title: 'Plan Definición y Pérdida de Grasa (1,750 kcal)',
    patientName: 'Sofía Rodríguez',
    objective: 'Pérdida de grasa corporal manteniendo masa muscular',
    includeWeekends: true,
    days: createDefaultWeekStructure(1.0, true), // Con menús precargados
    createdAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-06-28T14:30:00.000Z',
  },
  {
    id: 'plan-102',
    title: 'Plan Hipertrofia y Aumento de Fuerza (2,600 kcal)',
    patientName: 'Carlos Mendoza',
    objective: 'Ganancia de masa muscular limpia y rendimiento deportivo',
    includeWeekends: false,
    days: createDefaultWeekStructure(1.5, true),
    createdAt: '2026-06-20T09:15:00.000Z',
    updatedAt: '2026-07-01T11:20:00.000Z',
  },
  {
    id: 'plan-103',
    title: 'Plan Mantenimiento y Hábitos Saludables (2,000 kcal)',
    patientName: 'Ana Paula Gómez',
    objective: 'Estabilización de peso y control metabólico',
    includeWeekends: true,
    days: createDefaultWeekStructure(1.15, false),
    createdAt: '2026-06-25T16:45:00.000Z',
    updatedAt: '2026-07-02T18:10:00.000Z',
  },
];
