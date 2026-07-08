export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultPortion: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodDTO {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultPortion?: string;
  tags?: string[];
  notes?: string;
}

export type UpdateFoodDTO = Partial<CreateFoodDTO>;

export interface FoodQueryFilters {
  search?: string;
  category?: string;
}
