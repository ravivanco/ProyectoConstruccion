import { pool } from '../db/pool.js';
import {
  CreateMealLogInput,
  MealLog,
  MealType,
  MEAL_TYPES,
  UpdateMealLogInput,
} from '../types/tracking.js';

function mapRow(row: Record<string, unknown>): MealLog {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    mealType: String(row.meal_type) as MealType,
    foodName: row.food_name ? String(row.food_name) : undefined,
    calories: Number(row.calories),
    protein: Number(row.protein ?? 0),
    carbs: Number(row.carbs ?? 0),
    fat: Number(row.fat ?? 0),
    logDate: String(row.log_date).slice(0, 10),
    notes: row.notes ? String(row.notes) : undefined,
    dishId: row.dish_id ? String(row.dish_id) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}

export function isValidMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value);
}

export async function createMealLog(
  patientId: string,
  input: CreateMealLogInput,
): Promise<MealLog> {
  const result = await pool.query(
    `INSERT INTO meal_logs (
      patient_id, meal_type, food_name, calories, protein, carbs, fat,
      log_date, notes, dish_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE), $9, $10)
    RETURNING *`,
    [
      patientId,
      input.mealType,
      input.foodName ?? null,
      input.calories,
      input.protein ?? 0,
      input.carbs ?? 0,
      input.fat ?? 0,
      input.logDate ?? null,
      input.notes ?? null,
      input.dishId ?? null,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function listMealLogs(
  patientId: string,
  logDate?: string,
): Promise<MealLog[]> {
  const conditions = ['patient_id = $1'];
  const values: string[] = [patientId];

  if (logDate) {
    conditions.push('log_date = $2::date');
    values.push(logDate);
  }

  const result = await pool.query(
    `SELECT * FROM meal_logs
     WHERE ${conditions.join(' AND ')}
     ORDER BY log_date DESC, created_at DESC`,
    values,
  );
  return result.rows.map(mapRow);
}

export async function findMealLogById(id: string): Promise<MealLog | null> {
  const result = await pool.query('SELECT * FROM meal_logs WHERE id = $1', [id]);
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function updateMealLog(
  id: string,
  patientId: string,
  input: UpdateMealLogInput,
): Promise<MealLog | null> {
  const current = await findMealLogById(id);
  if (!current || current.patientId !== patientId) return null;

  const result = await pool.query(
    `UPDATE meal_logs SET
      meal_type = $3,
      food_name = $4,
      calories = $5,
      protein = $6,
      carbs = $7,
      fat = $8,
      log_date = COALESCE($9::date, log_date),
      notes = $10,
      dish_id = $11,
      updated_at = NOW()
    WHERE id = $1 AND patient_id = $2
    RETURNING *`,
    [
      id,
      patientId,
      input.mealType ?? current.mealType,
      input.foodName ?? current.foodName ?? null,
      input.calories ?? current.calories,
      input.protein ?? current.protein,
      input.carbs ?? current.carbs,
      input.fat ?? current.fat,
      input.logDate ?? null,
      input.notes ?? current.notes ?? null,
      input.dishId ?? current.dishId ?? null,
    ],
  );
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function deleteMealLog(id: string, patientId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM meal_logs WHERE id = $1 AND patient_id = $2',
    [id, patientId],
  );
  return (result.rowCount ?? 0) > 0;
}
