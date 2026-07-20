import { pool } from '../db/pool.js';
import {
  CreateDishInput,
  DISH_CATEGORIES,
  Dish,
  DishCategory,
  DishIngredient,
  UpdateDishInput,
} from '../types/dish.js';

function parseIngredients(value: unknown): DishIngredient[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        foodId: typeof row.foodId === 'string' ? row.foodId : undefined,
        name: String(row.name ?? ''),
        quantity: String(row.quantity ?? ''),
      };
    })
    .filter((item) => item.name);
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((tag) => String(tag)).filter(Boolean);
}

function mapRow(row: Record<string, unknown>): Dish {
  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category) as DishCategory,
    defaultPortion: row.default_portion ? String(row.default_portion) : undefined,
    calories: Number(row.calories),
    protein: Number(row.protein_g),
    carbs: Number(row.carbs_g),
    fat: Number(row.fat_g),
    ingredients: parseIngredients(row.ingredients),
    preparation: row.preparation ? String(row.preparation) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    tags: parseTags(row.tags),
    isActive: Boolean(row.is_active),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export function isValidDishCategory(value: string): value is DishCategory {
  return (DISH_CATEGORIES as readonly string[]).includes(value);
}

export async function listDishes(nutritionistId: string): Promise<Dish[]> {
  const result = await pool.query(
    'SELECT * FROM dishes WHERE nutritionist_id = $1 ORDER BY name ASC',
    [nutritionistId],
  );
  return result.rows.map(mapRow);
}

export async function findDishById(
  nutritionistId: string,
  id: string,
): Promise<Dish | null> {
  const result = await pool.query(
    'SELECT * FROM dishes WHERE id = $1 AND nutritionist_id = $2',
    [id, nutritionistId],
  );
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
}

export async function findDishByIdPublic(id: string): Promise<Dish | null> {
  const result = await pool.query('SELECT * FROM dishes WHERE id = $1 AND is_active = TRUE', [id]);
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
}

export async function createDish(
  nutritionistId: string,
  input: CreateDishInput,
): Promise<Dish> {
  const result = await pool.query(
    `INSERT INTO dishes (
      nutritionist_id, name, category, default_portion,
      calories, protein_g, carbs_g, fat_g,
      ingredients, preparation, image_url, tags
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12::jsonb)
    RETURNING *`,
    [
      nutritionistId,
      input.name.trim(),
      input.category,
      input.defaultPortion ?? null,
      input.calories,
      input.protein,
      input.carbs,
      input.fat,
      JSON.stringify(input.ingredients ?? []),
      input.preparation ?? null,
      input.imageUrl ?? null,
      JSON.stringify(input.tags ?? []),
    ],
  );
  return mapRow(result.rows[0]);
}

export async function updateDish(
  nutritionistId: string,
  id: string,
  input: UpdateDishInput,
): Promise<Dish | null> {
  const existing = await findDishById(nutritionistId, id);
  if (!existing) return null;

  const result = await pool.query(
    `UPDATE dishes SET
      name = $3,
      category = $4,
      default_portion = $5,
      calories = $6,
      protein_g = $7,
      carbs_g = $8,
      fat_g = $9,
      ingredients = $10::jsonb,
      preparation = $11,
      image_url = $12,
      tags = $13::jsonb,
      is_active = $14,
      updated_at = NOW()
    WHERE id = $1 AND nutritionist_id = $2
    RETURNING *`,
    [
      id,
      nutritionistId,
      input.name?.trim() ?? existing.name,
      input.category ?? existing.category,
      input.defaultPortion ?? existing.defaultPortion ?? null,
      input.calories ?? existing.calories,
      input.protein ?? existing.protein,
      input.carbs ?? existing.carbs,
      input.fat ?? existing.fat,
      JSON.stringify(input.ingredients ?? existing.ingredients),
      input.preparation ?? existing.preparation ?? null,
      input.imageUrl ?? existing.imageUrl ?? null,
      JSON.stringify(input.tags ?? existing.tags),
      input.isActive ?? existing.isActive,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function deleteDish(nutritionistId: string, id: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM dishes WHERE id = $1 AND nutritionist_id = $2',
    [id, nutritionistId],
  );
  return (result.rowCount ?? 0) > 0;
}
