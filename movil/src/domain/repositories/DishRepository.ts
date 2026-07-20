import { Dish } from '../models/Dish';

export interface DishRepository {
  getById(id: string): Promise<Dish | null>;
}
