export type FoodCategory = 'Proteínas' | 'Carbohidratos' | 'Grasas' | 'Frutas' | 'Verduras' | 'Lácteos';

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: string; // ej. "100g", "1 pieza", "1 taza (200ml)"
  calories: number;    // kcal por ración
  protein: number;     // gramos de proteína
  carbs: number;       // gramos de carbohidratos
  fat: number;         // gramos de grasas
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
