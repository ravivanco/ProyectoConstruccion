export interface DishIngredient {
  foodId?: string;
  name: string;
  quantity: string;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  defaultPortion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: DishIngredient[];
  preparation?: string;
  imageUrl?: string;
  tags: string[];
}
