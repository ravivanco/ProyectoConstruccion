export const DISH_CATEGORIES = [
  'Desayunos',
  'Almuerzos / Cenas',
  'Colaciones',
  'Bebidas y Batidos',
] as const;

export type DishCategory = (typeof DISH_CATEGORIES)[number];

export interface DishIngredient {
  foodId?: string;
  name: string;
  quantity: string;
}

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  defaultPortion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: DishIngredient[];
  preparation?: string;
  imageUrl?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishInput {
  name: string;
  category: DishCategory;
  defaultPortion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: DishIngredient[];
  preparation?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface UpdateDishInput {
  name?: string;
  category?: DishCategory;
  defaultPortion?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients?: DishIngredient[];
  preparation?: string;
  imageUrl?: string;
  tags?: string[];
  isActive?: boolean;
}
