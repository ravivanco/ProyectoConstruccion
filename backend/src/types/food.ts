export const FOOD_CATEGORIES = [
  'Proteínas',
  'Carbohidratos',
  'Grasas',
  'Frutas',
  'Verduras',
  'Lácteos',
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateFoodInput {
  name: string;
  category: FoodCategory;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UpdateFoodInput {
  name?: string;
  category?: FoodCategory;
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  isActive?: boolean;
}

export interface FoodFilters {
  search?: string;
  category?: FoodCategory;
  isActive?: boolean;
}
