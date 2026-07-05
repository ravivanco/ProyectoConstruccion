import { pool } from '../db/pool.js';
import {
  CreateFoodInput,
  Food,
  FoodCategory,
  FoodFilters,
  FOOD_CATEGORIES,
  UpdateFoodInput,
} from '../types/food.js';

function mapRow(row: Record<string, unknown>): Food {
  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category) as FoodCategory,
    servingSize: String(row.serving_size),
    calories: Number(row.calories),
    protein: Number(row.protein_g),
    carbs: Number(row.carbs_g),
    fat: Number(row.fat_g),
    isActive: Boolean(row.is_active),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export function isValidFoodCategory(value: string): value is FoodCategory {
  return (FOOD_CATEGORIES as readonly string[]).includes(value);
}

export async function listFoods(
  nutritionistId: string,
  filters: FoodFilters = {},
): Promise<Food[]> {
  const conditions = ['nutritionist_id = $1'];
  const values: Array<string | boolean> = [nutritionistId];
  let index = 2;

  if (filters.search?.trim()) {
    conditions.push(`LOWER(name) LIKE $${index}`);
    values.push(`%${filters.search.trim().toLowerCase()}%`);
    index += 1;
  }

  if (filters.category && isValidFoodCategory(filters.category)) {
    conditions.push(`category = $${index}`);
    values.push(filters.category);
    index += 1;
  }

  if (typeof filters.isActive === 'boolean') {
    conditions.push(`is_active = $${index}`);
    values.push(filters.isActive);
    index += 1;
  }

  const result = await pool.query(
    `SELECT * FROM foods WHERE ${conditions.join(' AND ')} ORDER BY name ASC`,
    values,
  );

  return result.rows.map(mapRow);
}

export async function findFoodById(
  nutritionistId: string,
  id: string,
): Promise<Food | null> {
  const result = await pool.query(
    'SELECT * FROM foods WHERE id = $1 AND nutritionist_id = $2',
    [id, nutritionistId],
  );
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
}

export async function createFood(
  nutritionistId: string,
  input: CreateFoodInput,
): Promise<Food> {
  const result = await pool.query(
    `INSERT INTO foods (
      nutritionist_id, name, category, serving_size,
      calories, protein_g, carbs_g, fat_g
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      nutritionistId,
      input.name.trim(),
      input.category,
      input.servingSize.trim(),
      input.calories,
      input.protein,
      input.carbs,
      input.fat,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function updateFood(
  nutritionistId: string,
  id: string,
  input: UpdateFoodInput,
): Promise<Food | null> {
  const existing = await findFoodById(nutritionistId, id);
  if (!existing) return null;

  const result = await pool.query(
    `UPDATE foods SET
      name = $3,
      category = $4,
      serving_size = $5,
      calories = $6,
      protein_g = $7,
      carbs_g = $8,
      fat_g = $9,
      is_active = $10,
      updated_at = NOW()
    WHERE id = $1 AND nutritionist_id = $2
    RETURNING *`,
    [
      id,
      nutritionistId,
      input.name?.trim() ?? existing.name,
      input.category ?? existing.category,
      input.servingSize?.trim() ?? existing.servingSize,
      input.calories ?? existing.calories,
      input.protein ?? existing.protein,
      input.carbs ?? existing.carbs,
      input.fat ?? existing.fat,
      input.isActive ?? existing.isActive,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function deleteFood(nutritionistId: string, id: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM foods WHERE id = $1 AND nutritionist_id = $2',
    [id, nutritionistId],
  );
  return (result.rowCount ?? 0) > 0;
}
