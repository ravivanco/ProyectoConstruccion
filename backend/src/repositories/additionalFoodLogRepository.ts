import { pool } from '../db/pool.js';
import {
  AdditionalFoodLog,
  CreateAdditionalFoodLogInput,
  UpdateAdditionalFoodLogInput,
} from '../types/tracking.js';

function mapRow(row: Record<string, unknown>): AdditionalFoodLog {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    foodName: String(row.food_name),
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    quantity: row.quantity ? String(row.quantity) : undefined,
    logDate: String(row.log_date).slice(0, 10),
    notes: row.notes ? String(row.notes) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}

export async function createAdditionalFoodLog(
  patientId: string,
  input: CreateAdditionalFoodLogInput,
): Promise<AdditionalFoodLog> {
  const result = await pool.query(
    `INSERT INTO additional_food_logs (
      patient_id, food_name, calories, protein, carbs, fat,
      quantity, log_date, notes, image_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE), $9, $10)
    RETURNING *`,
    [
      patientId,
      input.foodName,
      input.calories,
      input.protein ?? 0,
      input.carbs ?? 0,
      input.fat ?? 0,
      input.quantity ?? null,
      input.logDate ?? null,
      input.notes ?? null,
      input.imageUrl ?? null,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function listAdditionalFoodLogs(
  patientId: string,
  logDate?: string,
): Promise<AdditionalFoodLog[]> {
  const conditions = ['patient_id = $1'];
  const values: string[] = [patientId];

  if (logDate) {
    conditions.push('log_date = $2::date');
    values.push(logDate);
  }

  const result = await pool.query(
    `SELECT * FROM additional_food_logs
     WHERE ${conditions.join(' AND ')}
     ORDER BY log_date DESC, created_at DESC`,
    values,
  );
  return result.rows.map(mapRow);
}

export async function findAdditionalFoodLogById(
  id: string,
): Promise<AdditionalFoodLog | null> {
  const result = await pool.query('SELECT * FROM additional_food_logs WHERE id = $1', [id]);
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function updateAdditionalFoodLog(
  id: string,
  patientId: string,
  input: UpdateAdditionalFoodLogInput,
): Promise<AdditionalFoodLog | null> {
  const current = await findAdditionalFoodLogById(id);
  if (!current || current.patientId !== patientId) return null;

  const result = await pool.query(
    `UPDATE additional_food_logs SET
      food_name = $3,
      calories = $4,
      protein = $5,
      carbs = $6,
      fat = $7,
      quantity = $8,
      log_date = COALESCE($9::date, log_date),
      notes = $10,
      image_url = $11,
      updated_at = NOW()
    WHERE id = $1 AND patient_id = $2
    RETURNING *`,
    [
      id,
      patientId,
      input.foodName ?? current.foodName,
      input.calories ?? current.calories,
      input.protein ?? current.protein,
      input.carbs ?? current.carbs,
      input.fat ?? current.fat,
      input.quantity ?? current.quantity ?? null,
      input.logDate ?? null,
      input.notes ?? current.notes ?? null,
      input.imageUrl ?? current.imageUrl ?? null,
    ],
  );
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function deleteAdditionalFoodLog(
  id: string,
  patientId: string,
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM additional_food_logs WHERE id = $1 AND patient_id = $2',
    [id, patientId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getAdditionalIntakeImpact(patientId: string, periodDays = 7) {
  const planResult = await pool.query(
    `SELECT daily_calories FROM nutrition_plans
     WHERE patient_id = $1 AND status = 'active'
     ORDER BY activated_at DESC NULLS LAST
     LIMIT 1`,
    [patientId],
  );
  const plannedCaloriesPerDay = planResult.rowCount
    ? Number(planResult.rows[0].daily_calories)
    : 2000;

  const result = await pool.query(
    `SELECT log_date::text AS log_date, COALESCE(SUM(calories), 0) AS additional_calories
     FROM additional_food_logs
     WHERE patient_id = $1
       AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
       AND status = 'confirmed'
     GROUP BY log_date
     ORDER BY log_date ASC`,
    [patientId, periodDays],
  );

  const dailyImpact = result.rows.map((row) => {
    const additionalCalories = Number(row.additional_calories);
    const impactPercentage = plannedCaloriesPerDay > 0
      ? Math.round((additionalCalories / plannedCaloriesPerDay) * 100)
      : 0;
    return {
      date: String(row.log_date).slice(0, 10),
      additionalCalories,
      plannedCalories: plannedCaloriesPerDay,
      impactPercentage,
    };
  });

  const totalAdditionalCalories = dailyImpact.reduce((sum, day) => sum + day.additionalCalories, 0);
  const totalPlannedCalories = plannedCaloriesPerDay * periodDays;
  const overallImpactPercentage = totalPlannedCalories > 0
    ? Math.round((totalAdditionalCalories / totalPlannedCalories) * 100)
    : 0;

  return {
    patientId,
    periodDays,
    plannedCaloriesPerDay,
    totalAdditionalCalories,
    overallImpactPercentage,
    dailyImpact,
  };
}
