import { FoodItem, CreateFoodDTO, UpdateFoodDTO, FoodQueryFilters } from '../types/food.js';

let foodsStore: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Omelette de Claras con Espinaca y Champiñones',
    category: 'Desayunos',
    calories: 220,
    protein: 24,
    carbs: 6,
    fat: 8,
    defaultPortion: '1 plato grande (250g)',
    tags: ['Alto en Proteína', 'Bajo en Carbos', 'Desayuno'],
    notes: 'Preparar con rocío vegetal o 1 cdta de aceite de oliva.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'food-2',
    name: 'Bowl de Avena con Proteína y Arándanos',
    category: 'Desayunos',
    calories: 380,
    protein: 28,
    carbs: 48,
    fat: 7,
    defaultPortion: '1 tazón (300g)',
    tags: ['Fibra', 'Energía', 'Desayuno'],
    notes: 'Utilizar leche descremada o vegetal sin azúcar.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'food-3',
    name: 'Filete de Salmón al Horno con Espárragos',
    category: 'Almuerzos / Cenas',
    calories: 450,
    protein: 38,
    carbs: 8,
    fat: 26,
    defaultPortion: '1 filete + guarnición (300g)',
    tags: ['Omega 3', 'Keto', 'Almuerzo'],
    notes: 'Rociar con zumo de limón natural.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'food-4',
    name: 'Pechuga de Pollo a la Plancha con Quinoa y Brócoli',
    category: 'Almuerzos / Cenas',
    calories: 410,
    protein: 42,
    carbs: 38,
    fat: 8,
    defaultPortion: '1 plato completo (350g)',
    tags: ['Balanceado', 'Magro', 'Almuerzo'],
    notes: 'Cocinar al vapor para mantener nutrientes intactos.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'food-5',
    name: 'Yogur Griego Natural con Nueces y Semillas de Chía',
    category: 'Colaciones',
    calories: 210,
    protein: 16,
    carbs: 12,
    fat: 10,
    defaultPortion: '1 porción (180g)',
    tags: ['Probióticos', 'Snack', 'Omega 3'],
    notes: 'Sin azúcar añadida.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'food-6',
    name: 'Batido Whey Isolate con Leche de Almendras',
    category: 'Bebidas y Batidos',
    calories: 160,
    protein: 26,
    carbs: 4,
    fat: 3,
    defaultPortion: '1 vaso grande (350ml)',
    tags: ['Post-Entreno', 'Rápida Absorción'],
    notes: 'Tomar preferentemente en los 45 min posteriores al entrenamiento.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'food-7',
    name: 'Ensalada Mediterránea con Atún y Aguacate',
    category: 'Almuerzos / Cenas',
    calories: 340,
    protein: 29,
    carbs: 14,
    fat: 18,
    defaultPortion: '1 ensaladera mediana (280g)',
    tags: ['Bajo Índice Glucémico', 'Fresco'],
    notes: 'Aliñar con aceite de oliva extra virgen prensado en frío.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
  {
    id: 'food-8',
    name: 'Tostadas de Pan Integral de Masa Madre con Aguacate y Huevo',
    category: 'Desayunos',
    calories: 330,
    protein: 16,
    carbs: 28,
    fat: 16,
    defaultPortion: '2 rebanadas (200g)',
    tags: ['Desayuno', 'Grasas Saludables'],
    notes: 'Huevo pochado o a la plancha sin aceite extra.',
    createdAt: new Date('2026-07-01T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-01T08:00:00Z').toISOString(),
  },
];

export async function getAllFoods(filters?: FoodQueryFilters): Promise<FoodItem[]> {
  let results = [...foodsStore];

  if (filters?.category && filters.category !== 'Todos' && filters.category !== 'todas') {
    results = results.filter((f) => f.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters?.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return results;
}

export async function getFoodById(id: string): Promise<FoodItem | null> {
  const found = foodsStore.find((f) => f.id === id);
  return found ?? null;
}

export async function createFood(dto: CreateFoodDTO): Promise<FoodItem> {
  const newId = `food-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newItem: FoodItem = {
    id: newId,
    name: dto.name.trim(),
    category: dto.category.trim() || 'Almuerzos / Cenas',
    calories: Number(dto.calories) || 0,
    protein: Number(dto.protein) || 0,
    carbs: Number(dto.carbs) || 0,
    fat: Number(dto.fat) || 0,
    defaultPortion: dto.defaultPortion?.trim() || '1 porción estándar',
    tags: dto.tags || [],
    notes: dto.notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  foodsStore.unshift(newItem);
  return newItem;
}

export async function updateFood(id: string, dto: UpdateFoodDTO): Promise<FoodItem | null> {
  const idx = foodsStore.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  const current = foodsStore[idx];
  const updated: FoodItem = {
    ...current,
    name: dto.name !== undefined ? dto.name.trim() : current.name,
    category: dto.category !== undefined ? dto.category.trim() : current.category,
    calories: dto.calories !== undefined ? Number(dto.calories) : current.calories,
    protein: dto.protein !== undefined ? Number(dto.protein) : current.protein,
    carbs: dto.carbs !== undefined ? Number(dto.carbs) : current.carbs,
    fat: dto.fat !== undefined ? Number(dto.fat) : current.fat,
    defaultPortion: dto.defaultPortion !== undefined ? dto.defaultPortion.trim() : current.defaultPortion,
    tags: dto.tags !== undefined ? dto.tags : current.tags,
    notes: dto.notes !== undefined ? dto.notes.trim() : current.notes,
    updatedAt: new Date().toISOString(),
  };

  foodsStore[idx] = updated;
  return updated;
}

export async function deleteFood(id: string): Promise<boolean> {
  const initialLen = foodsStore.length;
  foodsStore = foodsStore.filter((f) => f.id !== id);
  return foodsStore.length < initialLen;
}
